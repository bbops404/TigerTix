import { Buffer as BufferPolyfill } from 'buffer/';
import process from 'process';

window.Buffer = BufferPolyfill;
window.process = process; 