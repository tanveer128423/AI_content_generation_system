import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ContentProvider } from './context/ContentContext';
import Sidebar from './components/Sidebar';
import MainWorkspace from './components/MainWorkspace';
import GeminiApiOnboarding from './components/GeminiApiOnboarding';
import { hasStoredGeminiApiKey, setStoredGeminiApiKey, subscribeToGeminiApiKeyChanges } from './ai/geminiApiKey';
import './App.css';

const MIN_SIDEBAR_WIDTH = 260;
const MAX_SIDEBAR_WIDTH = 500;
const DEFAULT_SIDEBAR_WIDTH = 300;
const SIDEBAR_WIDTH_STORAGE_KEY = 'content-generation-engine.sidebarWidth';

function clampSidebarWidth(width: number) {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, width));
}

function readStoredSidebarWidth() {
  if (typeof window === 'undefined') {
    return DEFAULT_SIDEBAR_WIDTH;
  }

  try {
    const storedWidth = window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);

    if (!storedWidth) {
      return DEFAULT_SIDEBAR_WIDTH;
    }

    const parsedWidth = Number(storedWidth);

    return Number.isFinite(parsedWidth) ? clampSidebarWidth(parsedWidth) : DEFAULT_SIDEBAR_WIDTH;
  } catch {
    return DEFAULT_SIDEBAR_WIDTH;
  }
}

function persistSidebarWidth(width: number) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(width));
  } catch {
    // Ignore storage failures and keep the live layout working.
  }
}

function MainAppShell() {
  const theme = useTheme();
  const isDesktopLayout = useMediaQuery(theme.breakpoints.up('md'));
  const sidebarShellRef = useRef<HTMLDivElement | null>(null);
  const sidebarWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH);
  const resizeFrameRef = useRef<number | null>(null);
  const resizeStateRef = useRef({
    active: false,
    left: 0,
    previousCursor: '',
    previousUserSelect: '',
  });
  const [sidebarWidth, setSidebarWidth] = useState(() => readStoredSidebarWidth());
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const applyLiveSidebarWidth = useCallback((width: number) => {
    const sidebarShell = sidebarShellRef.current;
    if (!sidebarShell) return;
    sidebarShell.style.setProperty('--sidebar-width', `${width}px`);
  }, []);

  useEffect(() => {
    sidebarWidthRef.current = sidebarWidth;
    applyLiveSidebarWidth(sidebarWidth);
  }, [applyLiveSidebarWidth, sidebarWidth]);

  useEffect(() => {
    if (!isDesktopLayout) {
      setIsResizingSidebar(false);
    }
  }, [isDesktopLayout]);

  useEffect(() => {
    if (isResizingSidebar) {
      return;
    }

    persistSidebarWidth(sidebarWidth);
  }, [isResizingSidebar, sidebarWidth]);

  const handleSidebarResizeMove = useCallback((event: PointerEvent) => {
    if (!resizeStateRef.current.active) {
      return;
    }

    const nextWidth = clampSidebarWidth(event.clientX - resizeStateRef.current.left);
    sidebarWidthRef.current = nextWidth;

    if (resizeFrameRef.current !== null) {
      return;
    }

    resizeFrameRef.current = window.requestAnimationFrame(() => {
      resizeFrameRef.current = null;
      applyLiveSidebarWidth(sidebarWidthRef.current);
    });
  }, [applyLiveSidebarWidth]);

  const stopSidebarResize = useCallback(() => {
    if (!resizeStateRef.current.active) {
      return;
    }

    resizeStateRef.current.active = false;
    window.removeEventListener('pointermove', handleSidebarResizeMove);
    window.removeEventListener('pointerup', stopSidebarResize);
    window.removeEventListener('pointercancel', stopSidebarResize);

    if (resizeFrameRef.current !== null) {
      window.cancelAnimationFrame(resizeFrameRef.current);
      resizeFrameRef.current = null;
    }

    const finalWidth = clampSidebarWidth(sidebarWidthRef.current);

    applyLiveSidebarWidth(finalWidth);
    setSidebarWidth(finalWidth);
    setIsResizingSidebar(false);
    persistSidebarWidth(finalWidth);

    document.body.style.cursor = resizeStateRef.current.previousCursor;
    document.body.style.userSelect = resizeStateRef.current.previousUserSelect;
  }, [applyLiveSidebarWidth, handleSidebarResizeMove]);

  const startSidebarResize = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDesktopLayout || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const sidebarShell = sidebarShellRef.current;

    if (!sidebarShell) {
      return;
    }

    resizeStateRef.current.active = true;
    resizeStateRef.current.left = sidebarShell.getBoundingClientRect().left;
    resizeStateRef.current.previousCursor = document.body.style.cursor;
    resizeStateRef.current.previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('pointermove', handleSidebarResizeMove);
    window.addEventListener('pointerup', stopSidebarResize);
    window.addEventListener('pointercancel', stopSidebarResize);

    setIsResizingSidebar(true);
  }, [handleSidebarResizeMove, isDesktopLayout, stopSidebarResize]);

  useEffect(() => {
    return () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }

      if (resizeStateRef.current.active) {
        window.removeEventListener('pointermove', handleSidebarResizeMove);
        window.removeEventListener('pointerup', stopSidebarResize);
        window.removeEventListener('pointercancel', stopSidebarResize);
      }

      resizeStateRef.current.active = false;

      document.body.style.cursor = resizeStateRef.current.previousCursor;
      document.body.style.userSelect = resizeStateRef.current.previousUserSelect;
    };
  }, [handleSidebarResizeMove, stopSidebarResize]);

  return (
    <ContentProvider>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.default',
          isolation: 'isolate',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at 14% 10%, rgba(59, 130, 246, 0.14), transparent 22%), radial-gradient(circle at 84% 8%, rgba(15, 118, 110, 0.12), transparent 20%), linear-gradient(180deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.40) 35%, rgba(255,255,255,0.68) 100%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 'auto auto 8% 10%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12), transparent 70%)',
            filter: 'blur(18px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: '8% 8% auto auto',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15, 118, 110, 0.10), transparent 68%)',
            filter: 'blur(16px)',
            pointerEvents: 'none',
          }}
        />
        <Box sx={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative', zIndex: 1, gap: { xs: 0, md: 1.5 }, p: { xs: 0, md: 1.5 } }}>
          <Box
            ref={sidebarShellRef}
            sx={{
              position: 'relative',
              width: { xs: '100%', md: 'var(--sidebar-width, 300px)' },
              flexBasis: { xs: '100%', md: 'var(--sidebar-width, 300px)' },
              minWidth: { xs: 0, md: MIN_SIDEBAR_WIDTH },
              maxWidth: { md: MAX_SIDEBAR_WIDTH },
              flexShrink: 0,
              alignSelf: 'stretch',
              overflow: 'visible',
              transition: {
                xs: 'none',
                md: isResizingSidebar ? 'none' : 'width 160ms ease, flex-basis 160ms ease',
              },
              willChange: isResizingSidebar ? 'width' : 'auto',
              borderRadius: { md: 4 },
              boxShadow: { md: '0 12px 40px rgba(15, 23, 42, 0.06)' },
            }}
          >
            <Box sx={{ height: '100%', overflow: 'hidden', borderRadius: { md: 4 } }}>
              <Sidebar width={sidebarWidth} />
            </Box>

            {isDesktopLayout && (
              <Box
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize sidebar"
                data-active={isResizingSidebar ? 'true' : 'false'}
                onPointerDown={startSidebarResize}
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: -6,
                  width: 12,
                  height: '100%',
                  cursor: 'col-resize',
                  zIndex: 3,
                  display: 'flex',
                  alignItems: 'stretch',
                  justifyContent: 'center',
                  opacity: isResizingSidebar ? 1 : 0,
                  transition: 'opacity 160ms ease',
                  userSelect: 'none',
                  touchAction: 'none',
                  '&::before': {
                    content: '""',
                    width: 2,
                    borderRadius: 999,
                    backgroundColor: 'rgba(100,116,139,0.18)',
                    transition: 'background-color 160ms ease',
                  },
                  '&:hover': {
                    opacity: 1,
                    backgroundColor: 'rgba(59,130,246,0.04)',
                  },
                  '&:hover::before, &[data-active="true"]::before': {
                    backgroundColor: 'rgba(59,130,246,0.55)',
                  },
                  '&[data-active="true"]': {
                    opacity: 1,
                  },
                }}
              />
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              bgcolor: 'rgba(255,255,255,0.5)',
              borderRadius: { md: 4 },
              overflow: 'hidden',
              boxShadow: { md: '0 14px 50px rgba(15, 23, 42, 0.06)' },
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <MainWorkspace />
          </Box>
        </Box>
      </Box>
    </ContentProvider>
  );
}

function App() {
  const [hasApiKey, setHasApiKey] = useState(() => hasStoredGeminiApiKey());

  useEffect(() => {
    return subscribeToGeminiApiKeyChanges(() => {
      setHasApiKey(hasStoredGeminiApiKey());
    });
  }, []);

  if (!hasApiKey) {
    return (
      <GeminiApiOnboarding
        onKeyValidated={() => setHasApiKey(true)}
      />
    );
  }

  return <MainAppShell />;
}

export default App;