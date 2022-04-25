export interface PageViewModel<T> {
  items: T[];
  total: number;
}

export abstract class ViewModel {
  public static async createOne<T extends ViewModel>(clazz: new () => T, element: unknown | Promise<unknown>, options: any[] = []): Promise<T> {
    if (element instanceof Promise) {
      return element.then(async resolved => await this.createOne(clazz, resolved, options));
    }

    return element ? await ViewModel.create(clazz, element, options) : undefined;
  }

  public static async createMany<T extends ViewModel>(clazz: new () => T, elements: any[] | Promise<any>, options: any[] = []): Promise<T[]> {
    if (elements instanceof Promise) {
      return elements.then(async resolved => await this.createMany(clazz, resolved, options));
    }

    return elements ? await Promise.all(elements.map((element: any) => ViewModel.create(clazz, element, options))) : undefined;
  }

  public static async createPage<T extends ViewModel>(clazz: new () => T, page: [any[], number] | Promise<[any[], number]>, options?: any[]): Promise<PageViewModel<T>> {
    if (page instanceof Promise) {
      return page.then(async resolved => await this.createPage(clazz, resolved, options));
    }

    return page ? { items: await this.createMany(clazz, page[0], options), total: page[1] } : undefined;
  }

  private static async create<T extends ViewModel>(clazz: new () => T, element: unknown, options: any[]): Promise<T> {
    return await (new clazz()).construct(element, options);
  }

  protected abstract construct(element: unknown, options?: any[]): Promise<any>;

  protected async mapObjectKeys<T>(toMap: Record<string, unknown>): Promise<T> {
    await Promise.all(Object.keys(toMap).map(async key => {
      this[key] = toMap[key] instanceof Promise ? await toMap[key] : toMap[key];
      return this[key];
    }));

    return this as unknown as T;
  }
}
