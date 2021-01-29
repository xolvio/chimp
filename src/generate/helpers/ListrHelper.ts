import { DefaultRenderer } from 'listr2/dist/renderer/default.renderer';
import logUpdate from 'log-update';
import debugConfigurator from 'debug';
import { ListrContext, ListrRendererFactory, ListrTaskWrapper } from 'listr2';
const debug = debugConfigurator('Listr');

export const newTask = (
  title: string,
  taskFunction: (task: ListrTaskWrapper<ListrContext, ListrRendererFactory>) => Promise<void>,
) => ({
  title,
  task: async (ctx: ListrContext, task: ListrTaskWrapper<ListrContext, ListrRendererFactory>) =>
    taskFunction(task).catch((error) => {
      debug('%O', error);
      throw new Error(`${title}\n${error}\n`);
    }),
});

// @ts-ignore
export class ListrRenderer extends DefaultRenderer {
  spinner = ['🙈 ', '🙉 ', '🙊 '];

  public render(): void {
    // Do not render if we are already rendering
    // @ts-ignore
    if (this.id) {
      return;
    }

    const updateRender = (): void => logUpdate(this.createRender());

    /* istanbul ignore if */
    if (!this.options?.lazy) {
      // @ts-ignore
      this.id = setInterval(() => {
        // @ts-ignore
        this.spinnerPosition = ++this.spinnerPosition % this.spinner.length;
        updateRender();
      }, 300);
    }

    // @ts-ignore
    this.renderHook$.subscribe(() => {
      updateRender();
    });
  }
}
