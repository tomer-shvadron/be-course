import {readFile} from './utils/file-reader';

const result = await readFile('./package.json');

console.log(result)
