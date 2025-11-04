import React, { useEffect } from 'react';
import FlashMessage from 'react-native-flash-message';

/**
 * Debug wrapper để phát hiện instance FlashMessage thừa
 * Nếu thấy log "FlashMessage MOUNTED" nhiều lần → có instance thừa
 */
export default function DebugFlash(props: any) {
  useEffect(() => {
    console.log('🔴 FlashMessage MOUNTED here - Check call stack!');
    return () => console.log('🔴 FlashMessage UNMOUNTED');
  }, []);
  
  return <FlashMessage {...props} />;
}

