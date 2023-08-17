import debugConfigurator from 'debug';
import {
  DefaultRenderer,
  Listr,
  ListrContext,
  ListrRendererFactory,
  ListrTask,
  ListrTaskWrapper,
  Spinner,
} from 'listr2';
const debug = debugConfigurator('Listr');

export const newTask = (
  title: string,
  taskFunction: (task: ListrTaskWrapper<ListrContext, ListrRendererFactory>) => Promise<void>,
): ListrTask => ({
  title,
  task: async (ctx: ListrContext, task: ListrTaskWrapper<ListrContext, ListrRendererFactory>) =>
    taskFunction(task).catch((error) => {
      debug('%O', error);
      throw new Error(`${title}\n${error}\n`);
    }),
  options: {
    persistentOutput: true,
  },
});

const spinner = new Spinner();
// @ts-ignore
spinner.spinner = ['🙈 ', '🙈 ', '🙉 ', '🙉 ', '🙊 ', '🙊 '];

export const setupListr = (tasks: ListrTask[]) =>
  new Listr(tasks, {
    renderer: DefaultRenderer,
    rendererOptions: {
      spinner,
    },
    fallbackRendererCondition: (): boolean => debug.enabled,
  });
