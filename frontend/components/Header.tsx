// frontend/components/Header.tsx
import { useState, type MouseEvent } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, Container, 
  Avatar, Menu, MenuItem, IconButton 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [mobileMenuEl, setMobileMenuEl] = useState<HTMLElement | null>(null);

  const handleMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event: MouseEvent<HTMLElement>) => {
    setMobileMenuEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMobileMenuEl(null);
  };

  const handleLogout = () => {
    navigate('/login');
    handleClose();
  };

  const menuItems = [
    { label: 'Início', path: '/' },
    { label: 'Funcionário', path: '/funcionario' },
    { label: 'Psicólogo', path: '/psicologo' },
    { label: 'Gestor', path: '/gestor' },
  ];

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo */}
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #147DAC 0%, #AE45AF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
            onClick={() => navigate('/')}
          >
            Burnoutzero
          </Typography>

          {/* Menu Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mr: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
                sx={{ 
                  textTransform: 'none',
                  borderBottom: location.pathname === item.path ? '2px solid #147DAC' : 'none',
                  borderRadius: 0,
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Menu Mobile */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 2 }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              onClick={handleMobileMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuEl}
              open={Boolean(mobileMenuEl)}
              onClose={handleClose}
            >
              {menuItems.map((item) => (
                <MenuItem 
                  key={item.path} 
                  onClick={() => {
                    navigate(item.path);
                    handleClose();
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Avatar do usuário */}
          <Box>
            <Avatar 
              onClick={handleMenu}
              sx={{ 
                cursor: 'pointer',
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
              }}
            >
              U
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Meu Perfil</MenuItem>
              <MenuItem onClick={handleClose}>Configurações</MenuItem>
              <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}