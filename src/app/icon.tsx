import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#3D8B4E',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          letterSpacing: '-0.5px',
        }}
      >
        F
      </div>
    ),
    size,
  )
}
