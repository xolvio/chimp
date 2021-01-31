import { DefaultRenderer } from 'listr2/dist/renderer/default.renderer';
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
  spinner = ['🙈 ', '🙈 ', '🙉 ', '🙉 ', '🙊 ', '🙊 '];
}
