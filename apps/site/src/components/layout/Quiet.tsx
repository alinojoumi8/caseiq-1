'use client';

import { Component } from 'react';
import type { ReactNode } from 'react';

interface QuietProps {
  children: ReactNode;
  /** Called once if what is inside throws, for a small cleanup (letting go of the hero's intro gate, say). */
  onError?: () => void;
}

/**
 * An error boundary for the parts that only add to a finished page (the motion pieces, the film player): if one throws, it
 * renders nothing and the rest of the page carries on. Without it Next replaces the whole document with its error screen.
 */
export class Quiet extends Component<QuietProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
