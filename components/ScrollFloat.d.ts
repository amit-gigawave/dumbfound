import React from 'react';

interface ScrollFloatProps {
  children: React.ReactNode;
  scrollContainerRef?: React.RefObject<any>;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
}

declare const ScrollFloat: React.FC<ScrollFloatProps>;

export default ScrollFloat;
