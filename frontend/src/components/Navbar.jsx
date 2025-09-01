"use client";

import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import { useThemeMode } from "@/app/ThemeContext";
import styles from '../styles/navbar.module.css';
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Container, ListItemButton, Tooltip } from "@mui/material";
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import Image from "next/image";

const pages = ['Home'];

const Navbar = () => {
  const { darkMode, toggleTheme } = useThemeMode();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (<>
    <AppBar
      position="fixed"
      sx={{
        boxShadow: 'none',
        backdropFilter: 'blur(3px)', // blur effect
        WebkitBackdropFilter: 'blur(3px)', // Safari support,
        transition: "border-bottom 0.5s ease, box-shadow 0.5s ease",
        borderBottom: isScrolled ? `${darkMode ? '1px solid rgb(49, 50, 53)' : ''}` : "none",
        boxShadow: isScrolled ? "0px 2px 4px rgba(47, 47, 47, 0.05)" : "none",
        px: { xs: 0, sm: 2 }
      }}
    >
      <Container className={styles.menuContainer} disableGutters maxWidth={false}>
        {/* Logo Desktop */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
            <Image src='/images/logo.png' height={35} width={35} alt='logo' />
            <Link href="/" passHref className={`${styles.linkDecoration}`}>
              <Typography
                variant="h4"
                noWrap
                sx={{
                  fontWeight: 700,
                  my: 1
                }}
              >
                Cognet
              </Typography>
            </Link>
          </Box>
        </Box>

        {/* Desktop links */}
        <Box
          sx={{
            flexGrow: 1,
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
          }}
        >
          {pages.map((page) => {
            const path = `/${page.toLowerCase().replace(" ", "-")}`;
            const isActive = pathname === path;
            return (
              <Link
                key={page}
                href={path}
                passHref
                className={`${styles.linkDecoration}`}
              >
                <Typography variant="body1" className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  sx={{ mx: 2, }}>
                  {page}
                </Typography>
              </Link>
            )
          })}
        </Box>

        {/* Mobile menu button */}
        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <IconButton size="large" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Mobile Logo */}
        <Box sx={{ display: { xs: "block", md: "none" }, }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
            <Image src='/images/logo.png' height={30} width={30} alt='logo' />
            <Link href="/" passHref className={`${styles.linkDecoration}`}>
              <Typography
                variant="h5"
                noWrap
                sx={{
                  fontWeight: 700,
                  my: 1
                }}
              >
                Cognet
              </Typography>
            </Link>
          </Box>
        </Box>

        {/* Right icons */}
        <Box>
          <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton sx={{ ml: 1 }} onClick={toggleTheme}>
              {darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
          {/* <Tooltip title="Profile">
            <IconButton sx={{ ml: 1 }} >
              <AccountCircleIcon />
            </IconButton>
          </Tooltip> */}
        </Box>
      </Container>
    </AppBar>

    {/* Mobile Drawer */}
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
    >
      <List sx={{ mt: 2, width: 250 }}>
        {pages.map((page) => {
          const path = `/${page.toLowerCase().replace(" ", "-")}`;
          const isActive = pathname === path;

          return (
            <ListItem key={page} disablePadding className={isActive ? styles.drawerItem : ''}>
              <Link
                href={path}
                passHref
                className={`${styles.linkDecoration}`}
              >
                <ListItemButton onClick={toggleDrawer(false)} sx={{ width: 250 }}>
                  <ListItemText primary={page} className={isActive ? styles.drawerItemActive : ''} />
                </ListItemButton>
              </Link>
            </ListItem>
          )
        })}
      </List>
    </Drawer>
  </>
  );
};

export default Navbar;
