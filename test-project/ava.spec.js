import test from 'ava';
import browser from 'chimp/ava/browser';


test(t => {
  t.deepEqual([1, 2], [1, 2]);
});