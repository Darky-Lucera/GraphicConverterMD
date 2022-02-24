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
/* global Heap */

class ColorQuantizer {
    constructor(num_bits) {
        if(num_bits == null)
            num_bits = 8;   // from 1 to 8
        this.nodes = [];
        this.root = this._node_create(0, 0, null);
        this.num_bits = num_bits;
        this.heap = new Heap(ColorQuantizer._node_compare);
        this.id = 0;
        this.fixed_colors = false;
    }

    add_color(r, g, b, count, fixed) {
        let bit, depth, idx;
        let node = this.root;

        if(count == null) {
            count = 1;
        }

        depth = 0;
        for (bit = 1 << 7; ++depth <= this.num_bits; bit >>= 1) {
            idx = !!(g & bit) * 4 + !!(r & bit) * 2 + !!(b & bit);
            if (!node.children[idx])
                node.children[idx] = this._node_create(idx, depth, node);
     
            node = node.children[idx];
        }
     
        node.r += r * count;
        node.g += g * count;
        node.b += b * count;
        node.count += count;
        node.fixed = fixed;
        if(fixed) {
            this.fixed_colors = true;
        }

        this.heap.push(node);
    }

    reduce_colors(num_colors, debug) {
        if(this.fixed_colors) {
            this.heap.set_node_compare(ColorQuantizer._node_compare_fixed);
        }

        if(debug) {
            console.log("Nodes:");
            this.heap.print_nodes();
        }
        
        let step = 0;
        while(this.heap.length() > num_colors + 1) {
            this.heap.push(this._fold(this.heap.pop()));
            if(debug) {
                console.log("Step " + (++step) + ":");
                this.heap.print_nodes();
            }
        }

        const res = [];
        for(let i=1; i<this.heap.length(); ++i) {
            const node = this.heap.nodes[i];
            const count = node.count + 0.0;
            const r = Math.round(node.r / count);
            const g = Math.round(node.g / count);
            const b = Math.round(node.b / count);
            res.push([r, g, b, node.count]);
        }

        return res;
    }

    //---------------------------------
    // Debug methods
    //---------------------------------

    check_integrity() {
        this.heap.check_integrity();
        for(let i=0; i<this.nodes.length; ++i) {
            const node = this.nodes[i];
            const parent = node.parent;
            if(parent != null) {
                const idx = parent.children.indexOf(node);
                if(idx != node.index_in_parent) {
                    console.error("Invalid index_in_parent at node " + i + " (" + node.id + ")");
                }
            }
            ColorQuantizer._node_check_integrity(node);
        }
    }
    
    //---------------------------------
    // Node methods
    //---------------------------------

    _node_create(index_in_parent, depth, parent) {
        const node = {};

        node.id = this.id++;
        node.fixed = false;
        node.depth = depth;
        node.count = 0;
        node.r = 0;
        node.g = 0;
        node.b = 0;
        node.index_in_parent = index_in_parent;
        node.num_children = 0;
        node.children = new Array(8);
        node.parent = parent;
        if(parent) {
            ++parent.num_children;
        }
        this.nodes.push(node);
        
        return node;
    }
    
    // For debugging
    static _node_check_integrity(node) {
        if(node.parent != null) {
            const idx = node.parent.children.indexOf(node);
            if(idx == -1) {
                console.error("Invalid parent (" + node.parent.id + ") for node " + node.id);
            }
            else if(idx != node.index_in_parent) {
                console.error("Invalid index_in_parent (" + node.index_in_parent + ")");
            }
            if(node.depth != node.parent.depth + 1) {
                console.error("Invalid depth");
            }
        }

        let num_children = 0;
        for(let i=0; i<node.children.length; ++i) {
            if(node.children[i] != null) {
                ++num_children;
                if(node.children[i].parent != node) {
                    console.error("Invalid children parent for node (" + node.children[i].id + "(must be " + node.id + ")");
                }
            }
        }
        if(num_children != node.num_children) {
            console.error("Invalid num_children");
        }
    }

    static _node_compare(nodeA, nodeB) {
        if (nodeA.num_children < nodeB.num_children) return -1;
        if (nodeA.num_children > nodeB.num_children) return 1;
     
        const ac = (nodeA.count + 0.0) / (1 << nodeA.depth);
        const bc = (nodeB.count + 0.0) / (1 << nodeB.depth);

        return ac < bc ? -1 : ac > bc;
    }

    static _node_compare_fixed(nodeA, nodeB) {
        if(nodeA.fixed == true && nodeB.fixed == false) return 1;
        if(nodeA.fixed == false && nodeB.fixed == true) return -1;

        if (nodeA.num_children < nodeB.num_children) return -1;
        if (nodeA.num_children > nodeB.num_children) return 1;
     
        const ac = (nodeA.count + 0.0) / (1 << nodeA.depth);
        const bc = (nodeB.count + 0.0) / (1 << nodeB.depth);

        return ac < bc ? -1 : ac > bc;
    }

    static _node_decrease_depth(node) {
        for(let i=0; i<node.children.length; ++i) {
            if(node.children[i] != null) {
                ColorQuantizer._node_decrease_depth(node.children[i]);
            }
        }
        node.depth--;
    }

    //---------------------------------
    // Private methods
    //---------------------------------

    _fold(node) {
        const parent = node.parent;

        if(node.num_children) {
            if(this.fixed_colors == false) {
                console.error("Invalid node!");
                return;
            }

            // This trick is ONLY to support fixed colors
            ColorQuantizer._node_decrease_depth(node);
            for(let i=0; i<node.children.length; ++i) {
                if(node.children[i] != null) {
                    const child = node.children[i];
                    node.children[i] = null;
                    node.num_children--;
                    if(parent.children[i] == null) {
                        parent.children[i] = child;
                    }
                    else {
                        child.index_in_parent = parent.children.length;
                        parent.children.push(child);
                    }
                    child.parent = parent;
                    parent.num_children++;
                    //ColorQuantizer._node_check_integrity(child);
                }
            }
        }

        if(parent.fixed) {
            // this should never happen
            console.error("parent is fixed");
            parent.r = (parent.r / parent.count) * (parent.count + node.count);
            parent.g = (parent.g / parent.count) * (parent.count + node.count);
            parent.b = (parent.b / parent.count) * (parent.count + node.count);
        }
        else if(node.fixed) {
            // this should never happen
            console.error("node is fixed");
            parent.r = (node.r / node.count) * (parent.count + node.count);
            parent.g = (node.g / node.count) * (parent.count + node.count);
            parent.b = (node.b / node.count) * (parent.count + node.count);
            parent.fixed = true;
        }
        else {
            parent.r += node.r;
            parent.g += node.g;
            parent.b += node.b;
        }

        parent.count += node.count;
        parent.num_children--;

        parent.children[node.index_in_parent] = null;
        node.parent = null;

        //this.check_integrity();
        return parent;
    }
}
