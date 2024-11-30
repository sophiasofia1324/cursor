interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category?: string;
  priority: 'high' | 'medium' | 'low';
  notifications: boolean;
}

interface GoalProgress {
  percentage: number;
  daysLeft: number;
  dailyRequired: number;
  isOnTrack: boolean;
}

export class GoalManager {
  private static instance: GoalManager;
  private goals: Map<string, SavingGoal> = new Map();
  private listeners: Set<(goals: SavingGoal[]) => void> = new Set();

  static getInstance() {
    if (!GoalManager.instance) {
      GoalManager.instance = new GoalManager();
    }
    return GoalManager.instance;
  }

  async addGoal(goal: Omit<SavingGoal, 'id'>): Promise<string> {
    const id = Date.now().toString();
    const newGoal = { ...goal, id };
    this.goals.set(id, newGoal as SavingGoal);
    this.notifyListeners();
    return id;
  }

  updateGoal(id: string, updates: Partial<SavingGoal>) {
    const goal = this.goals.get(id);
    if (goal) {
      const updatedGoal = { ...goal, ...updates };
      this.goals.set(id, updatedGoal);
      this.notifyListeners();
    }
  }

  deleteGoal(id: string) {
    this.goals.delete(id);
    this.notifyListeners();
  }

  getGoal(id: string): SavingGoal | undefined {
    return this.goals.get(id);
  }

  getAllGoals(): SavingGoal[] {
    return Array.from(this.goals.values());
  }

  getProgress(id: string): GoalProgress | null {
    const goal = this.goals.get(id);
    if (!goal) return null;

    const now = new Date();
    const daysLeft = Math.ceil((goal.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const dailyRequired = (goal.targetAmount - goal.currentAmount) / daysLeft;
    const expectedProgress = (goal.targetAmount / daysLeft) * (daysLeft - goal.deadline.getTime() + now.getTime());
    const isOnTrack = goal.currentAmount >= expectedProgress;

    return {
      percentage,
      daysLeft,
      dailyRequired,
      isOnTrack
    };
  }

  subscribe(listener: (goals: SavingGoal[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const goals = this.getAllGoals();
    this.listeners.forEach(listener => listener(goals));
  }
}

export const goalManager = GoalManager.getInstance(); 