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
import styles from '../styles/navbar.module.css';
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Container, ListItemButton, Tooltip } from "@mui/material";
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import Image from "next/image";
import logo from '../app/images/logo.png'
import { useThemeMode } from "@/app/contexts/ThemeContext";

const pages = [{ label: 'Map Using URL', url: 'using-url' }, { label: 'Map Using DOCs', url: 'using-docs' }];

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

        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <Image src={logo} height={40} width={40} alt='logo' className={darkMode ? styles.logoDark : styles.logoLight} />
          <Link href="/" passHref className={`${styles.linkDecoration}`}>
            <Typography
              variant="h4"
              noWrap
              sx={{
                fontWeight: 700,
                my: 1,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                color: 'text.primary'
              }}
            >
              Cognet
            </Typography>
          </Link>
        </Box>

        {/* Right icons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton sx={{ ml: 1 }} onClick={toggleTheme}>
              {darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
          <IconButton size="large" onClick={toggleDrawer(true)} >
            <MenuIcon />
          </IconButton>
        </Box>
      </Container>
    </AppBar>

    {/* Mobile Drawer */}
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
    >
      <List sx={{ mt: 2, width: 250 }}>
        {pages?.map(({ label, url }) => {
          const isActive = pathname === url;

          return (
            <ListItem key={url} disablePadding className={isActive ? styles.drawerItem : ''}>
              <Link
                href={url}
                passHref
                className={`${styles.linkDecoration}`}
              >
                <ListItemButton onClick={toggleDrawer(false)} sx={{ width: 250 }}>
                  <ListItemText primary={label} className={isActive ? styles.drawerItemActive : ''} />
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
