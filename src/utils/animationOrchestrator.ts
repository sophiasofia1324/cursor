interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number | ((idx: number) => number);
  threshold?: number;
}

interface AnimationSequence {
  id: string;
  animations: Array<{
    target: string;
    config: AnimationConfig;
    order: number;
  }>;
}

export class AnimationOrchestrator {
  private static instance: AnimationOrchestrator;
  private sequences: Map<string, AnimationSequence> = new Map();
  private running: Set<string> = new Set();

  static getInstance() {
    if (!AnimationOrchestrator.instance) {
      AnimationOrchestrator.instance = new AnimationOrchestrator();
    }
    return AnimationOrchestrator.instance;
  }

  createSequence(id: string): AnimationSequence {
    const sequence: AnimationSequence = {
      id,
      animations: []
    };
    this.sequences.set(id, sequence);
    return sequence;
  }

  addAnimation(
    sequenceId: string,
    target: string,
    config: AnimationConfig,
    order: number = 0
  ) {
    const sequence = this.sequences.get(sequenceId);
    if (sequence) {
      sequence.animations.push({ target, config, order });
      sequence.animations.sort((a, b) => a.order - b.order);
    }
  }

  async play(sequenceId: string) {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence || this.running.has(sequenceId)) return;

    this.running.add(sequenceId);
    
    try {
      for (const animation of sequence.animations) {
        await this.animate(animation.target, animation.config);
      }
    } finally {
      this.running.delete(sequenceId);
    }
  }

  private async animate(target: string, config: AnimationConfig): Promise<void> {
    return new Promise(resolve => {
      const element = document.querySelector(target);
      if (!element) {
        resolve();
        return;
      }

      const duration = config.duration || 1000;
      const easing = config.easing || 'ease';
      const delay = typeof config.delay === 'function' 
        ? config.delay(0) 
        : (config.delay || 0);

      element.animate(
        [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        {
          duration,
          easing,
          delay,
          fill: 'forwards'
        }
      ).onfinish = () => resolve();
    });
  }

  stop(sequenceId: string) {
    this.running.delete(sequenceId);
  }

  clear(sequenceId?: string) {
    if (sequenceId) {
      this.sequences.delete(sequenceId);
      this.running.delete(sequenceId);
    } else {
      this.sequences.clear();
      this.running.clear();
    }
  }
}

export const animationOrchestrator = AnimationOrchestrator.getInstance(); 