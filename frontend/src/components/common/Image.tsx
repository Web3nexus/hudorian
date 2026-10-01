import React from 'react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  priority?: boolean;
}

export default function Image({ fill, priority, className, style, alt = '', ...props }: ImageProps) {
  const fillStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        inset: '0px',
        ...style,
      }
    : style || {};

  return (
    <img
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      style={fillStyle}
      className={className}
      {...props}
    />
  );
}
