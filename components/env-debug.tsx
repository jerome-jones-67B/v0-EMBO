'use client';

import React from 'react';

/**
 * Environment Debug Component
 * Shows the actual environment variables available in the browser
 */
export function EnvDebug() {
  const envVars = {
    'NEXT_PUBLIC_DATA4REV_AUTH_TOKEN': process.env.NEXT_PUBLIC_DATA4REV_AUTH_TOKEN,
    'NEXT_PUBLIC_DATA4REV_API_BASE_URL': process.env.NEXT_PUBLIC_DATA4REV_API_BASE_URL,
    'NEXT_PUBLIC_USE_MOCK_DATA': process.env.NEXT_PUBLIC_USE_MOCK_DATA,
    'NODE_ENV': process.env.NODE_ENV,
  };

  const hasToken = !!process.env.NEXT_PUBLIC_DATA4REV_AUTH_TOKEN;
  const tokenLength = process.env.NEXT_PUBLIC_DATA4REV_AUTH_TOKEN?.length;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded max-w-md text-xs z-50">
      <h3 className="font-bold mb-2">🔧 Environment Debug</h3>
      
      <div className="mb-2">
        <strong>Status:</strong> {hasToken ? '✅ Token Present' : '❌ No Token'}
      </div>
      
      {tokenLength && (
        <div className="mb-2">
          <strong>Token Length:</strong> {tokenLength}
        </div>
      )}
      
      <div className="mb-2">
        <strong>Environment Variables:</strong>
      </div>
      
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key} className="mb-1">
          <span className="text-yellow-300">{key}:</span>{' '}
          <span className={value ? 'text-green-300' : 'text-red-300'}>
            {value ? (key.includes('TOKEN') ? `${value.substring(0, 10)}...` : value) : 'undefined'}
          </span>
        </div>
      ))}
      
      <div className="mt-2 text-yellow-300">
        <strong>Next Steps:</strong>
      </div>
      <div className="text-xs">
        {!hasToken && '1. Set environment variables in Vercel Dashboard'}
        {!hasToken && <br />}
        {!hasToken && '2. Redeploy your application'}
        {hasToken && '✅ Environment variables are properly set!'}
      </div>
    </div>
  );
}
