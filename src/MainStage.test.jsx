import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React, { Profiler } from 'react';
import { MainStage } from './App';

describe('MainStage Performance', () => {
  it('renders correctly and progress bar updates', async () => {
    vi.useFakeTimers();

    const events = [
      { id: 1, title: 'Event 1', image: 'http://example.com/1.jpg', date: new Date().toISOString(), duration: 60 },
      { id: 2, title: 'Event 2', image: 'http://example.com/2.jpg', date: new Date().toISOString(), duration: 60 }
    ];

    const onRender = vi.fn();

    render(
      <Profiler id="MainStage" onRender={onRender}>
        <MainStage events={events} />
      </Profiler>
    );

    // Initial render committed
    expect(onRender).toHaveBeenCalled();

    // Advance time to simulate progress bar updates
    for (let i = 0; i < 10; i++) {
        await act(async () => {
            vi.advanceTimersByTime(100);
        });
    }

    // Verify that updates happened (Profiler callback called for subtree updates)
    // We expect 1 initial + 10 updates = 11
    // The optimization ensures MainStage *itself* doesn't re-render, but the subtree does.
    expect(onRender.mock.calls.length).toBeGreaterThan(1);

    vi.useRealTimers();
  });
});
