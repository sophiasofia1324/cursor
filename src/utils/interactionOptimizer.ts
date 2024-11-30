interface InteractionConfig {
  debounceDelay?: number;
  throttleDelay?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

export class ChartInteractionOptimizer {
  private static instance: ChartInteractionOptimizer;
  private config: Required<InteractionConfig>;
  private interactionStates: Map<string, any> = new Map();
  private gestureHandlers: Map<string, Function[]> = new Map();

  private constructor(config: InteractionConfig = {}) {
    this.config = {
      debounceDelay: 150,
      throttleDelay: 100,
      longPressDelay: 500,
      doubleTapDelay: 300,
      ...config
    };
  }

  static getInstance(config?: InteractionConfig) {
    if (!ChartInteractionOptimizer.instance) {
      ChartInteractionOptimizer.instance = new ChartInteractionOptimizer(config);
    }
    return ChartInteractionOptimizer.instance;
  }

  optimizeChartInteractions(chartId: string, chart: any) {
    this.setupZoomOptimization(chartId, chart);
    this.setupDragOptimization(chartId, chart);
    this.setupTooltipOptimization(chartId, chart);
    this.setupGestureRecognition(chartId, chart);
  }

  private setupZoomOptimization(chartId: string, chart: any) {
    const throttledZoom = throttle((e: any) => {
      const option = chart.getOption();
      option.dataZoom = this.calculateOptimalZoomLevel(e, option.dataZoom);
      chart.setOption(option);
    }, this.config.throttleDelay);

    chart.on('dataZoom', throttledZoom);
  }

  private setupDragOptimization(chartId: string, chart: any) {
    let isDragging = false;
    let lastPosition = { x: 0, y: 0 };

    const handleDragStart = (e: any) => {
      isDragging = true;
      lastPosition = { x: e.offsetX, y: e.offsetY };
    };

    const handleDragMove = throttle((e: any) => {
      if (!isDragging) return;

      const deltaX = e.offsetX - lastPosition.x;
      const deltaY = e.offsetY - lastPosition.y;
      
      this.updateChartPosition(chart, deltaX, deltaY);
      lastPosition = { x: e.offsetX, y: e.offsetY };
    }, this.config.throttleDelay);

    const handleDragEnd = () => {
      isDragging = false;
    };

    chart.getZr().on('mousedown', handleDragStart);
    chart.getZr().on('mousemove', handleDragMove);
    chart.getZr().on('mouseup', handleDragEnd);
  }

  private setupTooltipOptimization(chartId: string, chart: any) {
    const showTooltip = debounce((params: any) => {
      chart.dispatchAction({
        type: 'showTip',
        seriesIndex: params.seriesIndex,
        dataIndex: params.dataIndex
      });
    }, this.config.debounceDelay);

    chart.on('mousemove', showTooltip);
  }

  private setupGestureRecognition(chartId: string, chart: any) {
    let touchStartTime = 0;
    let lastTapTime = 0;
    let initialTouchDistance = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartTime = Date.now();
      if (e.touches.length === 2) {
        initialTouchDistance = this.getTouchDistance(e.touches);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchDuration = Date.now() - touchStartTime;
      
      if (touchDuration > this.config.longPressDelay) {
        this.triggerGestureHandlers(chartId, 'longPress', e);
      } else {
        const currentTime = Date.now();
        if (currentTime - lastTapTime < this.config.doubleTapDelay) {
          this.triggerGestureHandlers(chartId, 'doubleTap', e);
          lastTapTime = 0;
        } else {
          lastTapTime = currentTime;
        }
      }
    };

    const handlePinch = throttle((e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      
      const currentDistance = this.getTouchDistance(e.touches);
      const scale = currentDistance / initialTouchDistance;
      
      this.triggerGestureHandlers(chartId, 'pinch', { scale });
    }, this.config.throttleDelay);

    chart.getZr().on('touchstart', handleTouchStart);
    chart.getZr().on('touchmove', handlePinch);
    chart.getZr().on('touchend', handleTouchEnd);
  }

  private getTouchDistance(touches: TouchList) {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculateOptimalZoomLevel(e: any, currentZoom: any) {
    // 实现智能缩放级别计算逻辑
    return currentZoom;
  }

  private updateChartPosition(chart: any, deltaX: number, deltaY: number) {
    const option = chart.getOption();
    // 实现图表位置更新逻辑
    chart.setOption(option);
  }

  private triggerGestureHandlers(chartId: string, gestureType: string, event: any) {
    const handlers = this.gestureHandlers.get(chartId) || [];
    handlers.forEach(handler => handler(gestureType, event));
  }

  registerGestureHandler(chartId: string, handler: Function) {
    const handlers = this.gestureHandlers.get(chartId) || [];
    handlers.push(handler);
    this.gestureHandlers.set(chartId, handlers);
  }

  cleanup(chartId: string) {
    this.interactionStates.delete(chartId);
    this.gestureHandlers.delete(chartId);
  }
}

export const interactionOptimizer = ChartInteractionOptimizer.getInstance(); 