interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
  category?: string;
}

export class TagManager {
  private static instance: TagManager;
  private tags: Map<string, Tag> = new Map();
  private userTags: Map<string, Set<string>> = new Map();

  static getInstance() {
    if (!TagManager.instance) {
      TagManager.instance = new TagManager();
    }
    return TagManager.instance;
  }

  createTag(userId: string, tag: Omit<Tag, 'id'>): Tag {
    const id = Date.now().toString();
    const newTag = { ...tag, id };
    this.tags.set(id, newTag);
    
    if (!this.userTags.has(userId)) {
      this.userTags.set(userId, new Set());
    }
    this.userTags.get(userId)!.add(id);
    
    return newTag;
  }

  getUserTags(userId: string): Tag[] {
    const tagIds = this.userTags.get(userId) || new Set();
    return Array.from(tagIds).map(id => this.tags.get(id)!);
  }

  updateTag(tagId: string, updates: Partial<Tag>) {
    const tag = this.tags.get(tagId);
    if (tag) {
      this.tags.set(tagId, { ...tag, ...updates });
    }
  }

  deleteTag(userId: string, tagId: string) {
    this.tags.delete(tagId);
    this.userTags.get(userId)?.delete(tagId);
  }
}

export const tagManager = TagManager.getInstance(); 