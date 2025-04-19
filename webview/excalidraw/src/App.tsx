import React, { useEffect, useState, useRef } from 'react';
import {
  Excalidraw,
  loadLibraryFromBlob,
  serializeLibraryAsJSON,
  THEME,
} from '@excalidraw/excalidraw';

import './styles.css';
import {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  LibraryItems,
} from '@excalidraw/excalidraw/types/types';
import { channel } from './channel';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

function detectTheme() {
  // switch (document.body.className) {
  //   case 'vscode-dark':
  //     return THEME.DARK;
  //   case 'vscode-light':
  //     return THEME.LIGHT;
  //   default:
  //     return THEME.LIGHT;
  // }
  return THEME.LIGHT;
}

function useTheme(initialThemeConfig: string) {
  const [themeConfig, setThemeConfig] = useState(initialThemeConfig);
  const getExcalidrawTheme = () => {
    switch (themeConfig) {
      case 'light':
        return THEME.LIGHT;
      case 'dark':
        return THEME.DARK;
      case 'auto':
        return detectTheme();
    }
  };
  const [theme, setTheme] = useState(getExcalidrawTheme());
  const updateTheme = () => {
    setTheme(getExcalidrawTheme());
  };

  useEffect(updateTheme, [themeConfig]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      updateTheme();
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  return { theme, setThemeConfig };
}

export default function App(props: {
  initialData?: ExcalidrawInitialDataState;
  name: string;
  theme: string;
  langCode: string;
  viewModeEnabled: boolean;
  libraryItems?: LibraryItems;
  imageParams: {
    exportBackground: boolean;
    exportWithDarkMode: boolean;
    exportScale: 1 | 2 | 3;
  };
  dirty: boolean;
  onChange: (
    elements: readonly ExcalidrawElement[],
    appState: Partial<AppState>,
    files?: BinaryFiles
  ) => void;
}) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  const libraryItemsRef = useRef(props.libraryItems);
  const { theme, setThemeConfig } = useTheme(props.theme);
  const [imageParams, setImageParams] = useState(props.imageParams);
  const [langCode, setLangCode] = useState(props.langCode);

  useEffect(() => {
    if (!props.dirty) {
      return;
    }
    if (props.initialData) {
      const { elements, appState, files } = props.initialData;
      props.onChange(elements || [], appState || {}, files);
    } else {
      props.onChange([], { gridSize: null, viewBackgroundColor: '#ffffff' }, {});
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const listener = async (e: any) => {
      // TODO: Not supported for now.
      // try {
      //   const message = e.data;
      //   switch (message.type) {
      //     case 'library-change': {
      //       const blob = new Blob([message.library], {
      //         type: 'application/json',
      //       });
      //       const libraryItems = await loadLibraryFromBlob(blob);
      //       if (JSON.stringify(libraryItems) == JSON.stringify(libraryItemsRef.current)) {
      //         return;
      //       }
      //       libraryItemsRef.current = libraryItems;
      //       excalidrawAPI?.updateLibrary({
      //         libraryItems,
      //         merge: message.merge,
      //         openLibraryMenu: !message.merge,
      //       });
      //       break;
      //     }
      //     case 'theme-change': {
      //       setThemeConfig(message.theme);
      //       break;
      //     }
      //     case 'language-change': {
      //       setLangCode(message.langCode);
      //       break;
      //     }
      //     case 'image-params-change': {
      //       setImageParams(message.imageParams);
      //     }
      //   }
      // } catch (e) {
      //   channel.postMessage({
      //     type: 'error',
      //     content: (e as Error).message,
      //   });
      // }
    };
    channel.addEventListener('message', listener);

    return () => {
      channel.removeEventListener('message', listener);
    };
  }, []);

  return (
    <div className="excalidraw-wrapper">
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
          },
        }}
        langCode={langCode}
        name={props.name}
        theme={theme}
        viewModeEnabled={props.viewModeEnabled}
        initialData={{
          ...props.initialData,
          libraryItems: props.libraryItems,
          scrollToContent: true,
        }}
        // libraryReturnUrl={'vscode://pomdtr.excalidraw-editor/importLib'}
        onChange={(elements, appState, files) =>
          props.onChange(elements, { ...appState, ...imageParams, exportEmbedScene: true }, files)
        }
        onLinkOpen={(element, event) => {
          channel.postMessage({
            type: 'link-open',
            url: element.link,
          });
          event.preventDefault();
        }}
        onLibraryChange={(libraryItems) => {
          // TODO: Not supported for now.
          if (JSON.stringify(libraryItems) == JSON.stringify(libraryItemsRef.current)) {
            return;
          }
          libraryItemsRef.current = libraryItems;
          channel.postMessage({
            type: 'library-change',
            library: serializeLibraryAsJSON(libraryItems),
          });
        }}
      />
    </div>
  );
}
