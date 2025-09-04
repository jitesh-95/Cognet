# utils/llm_handler.py

import asyncio
import logging
from typing import Any, Callable, Dict, Optional

from langchain_core.exceptions import OutputParserException

logger = logging.getLogger(__name__)


class LLMTokenExpiredError(Exception):
    """Raised when LLM token is expired or invalid."""


async def safe_invoke(
    llm_func: Callable[..., Any],
    *args,
    retries: int = 3,
    backoff: float = 2.0,
    **kwargs
) -> Optional[Dict]:
    """
    Safely invoke an LLM function with retry & error handling.

    Args:
        llm_func: The LLM function (usually `chain.ainvoke`).
        *args: Positional args for the function.
        retries: Number of retries before failing.
        backoff: Delay (in seconds) between retries.
        **kwargs: Keyword args for the function.

    Returns:
        Response from the LLM or None if it fails.
    """

    for attempt in range(1, retries + 1):
        try:
            return await llm_func(*args, **kwargs)

        except Exception as e:
            err_msg = str(e).lower()

            # Handle token expiration
            if "401" in err_msg or "unauthorized" in err_msg or "token" in err_msg:
                logger.error("❌ Token expired or invalid: %s", e)
                raise LLMTokenExpiredError("LLM token expired or invalid")

            # Handle rate limiting
            if "429" in err_msg or "rate limit" in err_msg:
                logger.warning(
                    "⚠️ Rate limit hit (attempt %d/%d). Retrying in %.1f sec...",
                    attempt, retries, backoff
                )
                await asyncio.sleep(backoff)
                continue

            # Handle output parsing errors
            if isinstance(e, OutputParserException):
                logger.error("❌ Parsing error: %s", e)
                return None

            # For any other error
            logger.error(
                "❌ Unexpected LLM error on attempt %d/%d: %s", attempt, retries, e
            )
            await asyncio.sleep(backoff)

    logger.error("❌ Failed after %d retries", retries)
    return None
