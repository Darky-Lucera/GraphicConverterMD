//
// Copyright 2019, Carlos Aragones Martinez 
// @luceraproject (www.lucera-project.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to 
// deal in the Software without restriction, including without limitation the 
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
// sell copies of the Software, and to permit persons to whom the Software is 
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software.

// The Software shall be used for Good, not Evil.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
// IN THE SOFTWARE.

'use strict';

/* jshint esversion: 6 */
/* global console */

class Heap {
    constructor(compare) {
        this.nodes = [null];
        this.compare = compare;
    }

    push(node) {
        if(node.in_heap) {
            this._sink_down(node);
            this._bubble_up(node);
            return;
        }

        node.in_heap = true;
        node.heap_index = this.nodes.length;
        this.nodes.push(node);
        this._bubble_up(node);
    }

    pop() {
        if(this.nodes.length == 0)
            return null;

        const ret = this.nodes[1];
        this.nodes[1] = this.nodes.pop();
        this.nodes[1].heap_index = 1;
        this._sink_down(this.nodes[1]);

        return ret;
    }

    length() {
        return this.nodes.length;
    }

    set_node_compare(compare) {
        this.compare = compare;
    }

    //---------------------------------
    // Debug methods
    //---------------------------------

    check_integrity() {
        for(let i=1; i<this.nodes.length; ++i) {
            if(this.nodes[i].heap_index != i) {
                console.error("Invalid heap_index at node " + i + " (" + this.nodes[i].heap_index + ")");
            }
        }
    }

    print_nodes() {
        for(let i=1; i<this.nodes.length; ++i) {
            console.log(this.nodes[i]);
        }
    }

    //---------------------------------
    // Private methods
    //---------------------------------

    _bubble_up(node) {
        let index = node.heap_index;
        
        while(index > 1) {
            const prev = this.nodes[index >> 1];
            if(this.compare(node, prev) >= 0) 
                break;

            this.nodes[index] = prev;
            prev.heap_index = index;
            index >>= 1;
        }
        this.nodes[index] = node;
        node.heap_index = index;
    }

    _sink_down(node) {
        let n, m;

        n = node.heap_index;
        while(1) {
            m = n << 1;
            if (m >= this.nodes.length) 
                break;
            
            if (m + 1 < this.nodes.length && this.compare(this.nodes[m], this.nodes[m + 1]) > 0) 
                ++m;
     
            if (this.compare(node, this.nodes[m]) <= 0) 
                break;
     
            this.nodes[n] = this.nodes[m];
            this.nodes[n].heap_index = n;
            n = m;
        }
        this.nodes[n] = node;
        node.heap_index = n;
    }

}