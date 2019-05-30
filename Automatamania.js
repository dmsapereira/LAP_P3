/*
 * Automatamania
 *

Aluno 1: ?number ?name <-- mandatory to fill
Aluno 2: ?number ?name <-- mandatory to fill

Comment:

?????????????????????????
?????????????????????????
?????????????????????????
?????????????????????????
?????????????????????????
?????????????????????????

01234567890123456789012345678901234567890123456789012345678901234567890123456789

INSIDE THIS FILE, YOU CAN CHANGE EVERYTHING YOU WANT!
/*

/*
DOCUMENTATION

HTML and DOM documentation:
	http://ctp.di.fct.unl.pt/miei/lap/teoricas/17.html
	https://www.w3schools.com/html/default.asp
	https://www.w3schools.com/js/js_htmldom.asp

CSS documentation:
	https://www.w3schools.com/css/default.asp

JavaScript introduction:
	http://ctp.di.fct.unl.pt/miei/lap/teoricas/18.html
	http://ctp.di.fct.unl.pt/miei/lap/teoricas/19.html
	https://www.w3schools.com/js/default.asp

Cytoscape.js documentation:
	http://js.cytoscape.org/
*/

/* UTILITY GLOBAL FUNCTIONS ------------------------------------------------- */

function equals(a, b) {  // fairly general structural comparison
	if( a === b )
		return true;
	if( !(a instanceof Object) || !(b instanceof Object) )
		return false;
	if( a.constructor !== b.constructor )
		return false;
	const aProps = Object.getOwnPropertyNames(a);
	const bProps = Object.getOwnPropertyNames(b);
	if( aProps.length != bProps.length )
		return false;
	for( var i = 0; i < aProps.length; i++ ) {
		const propName = aProps[i];
		if( !equals(a[propName], b[propName]) )
			return false;
	}
	return true;
}

function belongs(v, arr) {
	return arr.some(x => equals(x, v));
}

function canonical(arr) {
	// This version do not sort, so that we can control the order of the
	// states of the finite automata in the screen presentation
	const res = [];
	arr.forEach( x => { if(!belongs(x, res)) res.push(x); } );
	return res;
}

function canonicalPrimitive(arr) {
	// This version do not sort, so that we can control the order of the
	// states of the finite automata in the screen presentation
	return Array.from(new Set(arr));
}

function cons(v, arr) {
	return [v].concat(arr);
}

function consLast(v, arr) {
	return arr.concat(v);
}

function isEmpty(arr) {
	// Beware: arr == [] does not work
	// For example, note that [] == [] is false
	return arr.length == 0;
}

function intersection(arr1, arr2) {
	return arr1.filter(value => arr2.includes(value));
}

function addAll(v, arr) {
	return arr.map(l => cons(v,l));
}

function flatMap(f, arr) {
	return arr.map(f).reduce((acc,a)=>consLast(acc,a), []);
}

function clone(obj) {
	return Object.assign({}, obj);
}


/* FINITE AUTOMATA ---------------------------------------------------------- */

class AbstractAutomaton {  // common features to FA, PDA, TM, etc.
	constructor() {}
}

class FiniteAutomaton extends AbstractAutomaton {
	constructor(fa) {
		super();
		this.initialState = fa.initialState;
		this.transitions = fa.transitions;
		this.acceptStates = fa.acceptStates;
	}

	getStates() {
		return canonical(
			[this.initialState].
			concat(this.transitions.map(([s,_0,_1]) => s)).
			concat(this.transitions.map(([_0,_1,s]) => s)).
			concat(this.acceptStates)
		);
	}

	getAlphabet(){
		var result = [];
		for(var i = 0; i < this.transitions.length; i++)
			result.push(this.transitions[i][1]);
		return canonical(result);
}

	generateX (n, s, ts, a){
    if (n == 0){
        if (belongs(s, a))
						return [[]];
				else
						return [];
    }else{
        const x = this.gcut(s,ts)[0];
        var asd = x.flatMap(([_,symb,next]) => (addAll(symb, this.generateX((n-1), next, ts, a))));
				console.log(asd);
				return asd;
		}
	}
	gcut(s, ts) {
		return [ts.filter(([z,_0,_1]) => z == s),
				ts.filter(([z,_0,_1]) => z != s)];
	}

	isDeterministic(){
		const states = this.getStates();
		var t, symb;
		for(var state of states){
			t = this.transitions.filter(([x,_0,_1]) => x == state)
			symb = t.map(([_0,y,_1]) => y);
			if(canonical(symb).length != t.length)
				return false;
		}
		return true;
	}

	reachableX(s, ts) {
		const [x, xs] = this.gcut(s,ts);
		return cons(s, flatMap(([_0,_1,z]) => this.reachableX(z,xs), x));
	}

	reachable() {
		return canonical(this.reachableX(this.initialState, this.transitions));
	}

	productive() {
		const allStates = this.getStates();
		const reachAccepted =
				s => !isEmpty(intersection(this.acceptStates,
							this.reachableX(s, this.transitions)));
		return allStates.filter(reachAccepted);
	}

	transitionsFor(s, symb) {
		return this.transitions.filter(([s1,symb1,_]) =>
									s == s1 && symb == symb1);
	}

	getNextStates(state, symb){
		const trans = this.transitionsFor(state, symb);
		return trans.flatMap(([_0,_1, next]) => next);
	}

	acceptX(s, w) {
		if( isEmpty(w) )
			return this.acceptStates.includes(s);
		else {
			const [x,...xs] = w;
			const ts = this.transitionsFor(s,x);
			if( isEmpty(ts) )
				return false;
			else {
				const [[_0,_1,s],..._] = ts;
				return this.acceptX(s,xs);
			}
		}
	  }

	accept(w) {
		return this.acceptX(this.initialState,w);
	}

	accept2X (s, w){
    if(w == [])
        return belongs(s, this.acceptStates);
    else{
			const x = w[0];
			const xs = w.slice(1);
      const l = this.transitionsFor(s,x);
      return l.some(([_0,_1,next]) => this.accept2X(next, xs), l);
		}
	}

	accept2(w){
		return this.accept2X(this.initialState, w);
	}
}

const abc = new FiniteAutomaton({
	initialState: "START",
	transitions: [
			["START",'a',"A"], ["START",'b',"START"],
						["START",'c',"START"], ["START",'d',"START"],
			["A",'a',"A"], ["A",'b',"AB"], ["A",'c',"START"], ["A",'d',"START"],
			["AB",'a',"A"], ["AB",'b',"START"],
						["AB",'c',"SUCCESS"], ["AB",'d',"START"],
			["SUCCESS",'a',"SUCCESS"], ["SUCCESS",'b',"SUCCESS"],
						["SUCCESS",'c',"SUCCESS"], ["SUCCESS",'d',"SUCCESS"]
		],
	acceptStates: ["SUCCESS"]
});

function testAll() {
//	getAlphabet
	console.log("");
	console.log(abc.getStates());
	console.log("");
	console.log(abc.gcut(abc.initialState, abc.transitions));
	console.log("");
	console.log(abc.reachable());
	console.log("");
	console.log(abc.productive());
	console.log("");
	console.log(abc.accept(['a','b','c']));
	console.log("");
	console.log(abc.accept(['a','b']));
//	generate
//	accept2
}

//Â testAll();


/* CYTOSCAPE GRAPHS AND USER INTERFACE -------------------------------------- */
// global constants and variables
var cyGraph;

const cyGraphStyle = {
	  layout: {
		name: 'grid',
		rows: 2,
		cols: 2
	  },

	  style: [
		{ selector: 'node[name]',
		  style: {
			'content': 'data(name)'
		  }},

		{ selector: 'edge',
		  style: {
			'curve-style': 'bezier',
			'target-arrow-shape': 'triangle',
			'label': 'data(symbol)'
		  }},

		// some style for the extension

		{ selector: '.eh-handle',
		  style: {
			'background-color': 'red',
			'width': 12,
			'height': 12,
			'shape': 'ellipse',
			'overlay-opacity': 0,
			'border-width': 12, // makes the handle easier to hit
			'border-opacity': 0
		  }},

		{ selector: '.eh-hover',
		  style: {
			'background-color': 'red'
		  }},

		{ selector: '.eh-source',
		  style: {
			'border-width': 2,
			'border-color': 'red'
		  }},

		{ selector: '.eh-target',
		  style: {
			'border-width': 2,
			'border-color': 'red'
		  }
		},

		{ selector: '.eh-preview, .eh-ghost-edge',
		  style: {
			'background-color': 'red',
			'line-color': 'red',
			'target-arrow-color': 'red',
			'source-arrow-color': 'red'
		  }},

		{ selector: '.eh-ghost-edge.eh-preview-active',
		  style: {
			'opacity': 0
		  }}
	  ]
};

class CyGraph {
	constructor(nodes, edges, fa) {
		const spec = clone(cyGraphStyle);
		spec.elements = { "nodes": nodes, "edges": edges};
		spec.container = document.getElementById('cy');  // the graph is placed in the DIV 'cy'
		this.cy = cytoscape(spec);
		this.cy.$('#START').select();
		this.cy.boxSelectionEnabled(false);
//		this.cy.on('select', e => alert(e.target.id()));
		this.fa = fa;
		this.refreshStatistics();
	}

	refreshStatistics(){
		accept_result.value = "";
		states.value = this.fa.getStates().length;
		accept_states.value = this.fa.acceptStates.length;
		alph_size.value = this.fa.getAlphabet().length;
		deterministic.value = this.fa.isDeterministic() ? "Yes" : "No";
	}

	static build(fa) {
    function buildStates(state){
      return { data: { id: state, name: state } }
    }

    function buildEdges(transition){
      return { data: { source: transition[0], symbol: transition[1], target: transition[2] } }
    }
		const nodes = fa.getStates().map(buildStates);
		const edges = fa.transitions.map(buildEdges);
		return new CyGraph(nodes, edges, fa);
	}

	static load(text) {
		try {
			const json = JSON.parse(text);
			const fa = new FiniteAutomaton(json);
			return this.build(fa);
		} catch( ex ) {
			alert(ex);
			document.getElementById('file-select').value = "";
		}
	}

	static sampleGraph() {
		return new CyGraph(
			[
			  { data: { id: "START", name: "START" } },
			  { data: { id: "A", name: "A" } },
			  { data: { id: "AB", name: "AB" } },
			  { data: { id: "SUCCESS", name: "SUCCESS" } }
			],
			[
			  { data: { source: "START", symbol: 'a', target: "A" } },
			  { data: { source: "START", symbol: 'b', target: "START" } },
			  { data: { source: "START", symbol: 'c', target: "START" } },
			  { data: { source: "START", symbol: 'd', target: "START" } },
			  { data: { source: "A", symbol: 'a', target: "A" } },
			  { data: { source: "A", symbol: 'b', target: "AB" } },
			  { data: { source: "A", symbol: 'c', target: "START" } },
			  { data: { source: "A", symbol: 'd', target: "START" } },
			  { data: { source: "AB", symbol: 'a', target: "A" } },
			  { data: { source: "AB", symbol: 'b', target: "START" } },
			  { data: { source: "AB", symbol: 'c', target: "SUCCESS" } },
			  { data: { source: "AB", symbol: 'd', target: "START" } },
			  { data: { source: "SUCCESS", symbol: 'a', target: "SUCCESS" } },
			  { data: { source: "SUCCESS", symbol: 'b', target: "SUCCESS" } },
			  { data: { source: "SUCCESS", symbol: 'c', target: "SUCCESS" } },
			  { data: { source: "SUCCESS", symbol: 'd', target: "SUCCESS" } }
			],
			abc
		);
	}




}


/* EVENT HANDLING ----------------------------------------------------------- */
//Auxiliary Functions

function getStateNode(state){
	return cyGraph.cy.$('#' + state);
}

function getSelectedState(){
	return cyGraph.cy.$(':selected').data('name');
}

function paintReachableNodes(){
	const transitions = cyGraph.fa.transitions;
	if(getSelectedState() == undefined)
				getStateNode(cyGraph.fa.initialState).select();
	const reachStates =
			canonicalPrimitive(cyGraph.fa.reachableX(getSelectedState()
																		,transitions)).slice(1);
	reachStates.forEach(state =>
		getStateNode(state).style('background-color', 'purple'));
}

function paintProductiveNodes(){
	const productiveStates = cyGraph.fa.productive();
	productiveStates.forEach(state =>
			getStateNode(state).style('background-color', 'yellow'));
}

function paintUsefulNodes(){
	const usefulNodes = cyGraph.fa.reachable();
	usefulNodes.forEach(state => getStateNode(state).style('background-color', 'green'));
}

function printAlphabet(n){
	const automata = cyGraph.fa;
	const alphabet = canonicalPrimitive(automata.generateX(n, automata.initialState,
	 													automata.transitions, automata.acceptStates));
	const listBox = generate_result.options;
	var i = 0;
	alphabet.forEach((a) => (listBox[i++] = new Option(a,a)));
}

function paintNextstates(){
	getStateNode("START").style('background-color', 'blue');
	var nodes = cyGraph.cy.nodes().filter(node => (node.style('background-color') == "rgb(0,0,255)"));
	if(nodes.length == 0)
		nodes.add(getStateNode(cyGraph.fa.initialState));
	nodes = nodes.map(node => getStateNode(cyGraph.fa.getNextStates(node.data('name'), String(input.value).charAt(0))));
	//nodes = nextStates.map()
	input.value = input.value.slice(1);
	if(input.value == []){
		nodes.forEach(node => node.style("background-color", "red"));
		nodes = nodes.filter(node => belongs(node.data('name'), cyGraph.fa.acceptStates));
		nodes.forEach(node => node.style("background-color", "green"));
	}else
		nodes = nodes.forEach(node => node.style('background-color', 'blue'));
}

//HTML Functions
function onLoadAction(event) {
	cyGraph = CyGraph.sampleGraph();
	cyGraph.refreshStatistics();
}

function op1Action(event) {
		paintReachableNodes();
}

function op2Action(event) {
	paintProductiveNodes();
}

function op3Action(event) {
	paintUsefulNodes();
}

function op4Action(event){
	if(input.value == undefined || input.value == null || input.value == "")
		alert("Invalid input!");
	else{
		console.log(input.value);
		printAlphabet(input.value);
	}
}

function op5Action(event){
	if(deterministic.value == "Yes")
		accept_result.value = cyGraph.fa.accept(input.value) ? "Yes" : "No";
	else
		accept_result.value = cyGraph.fa.accept2(input.value) ? "Yes" : "No";
}

function op6Action(event){
	paintNextstates();
}

function fileSelectAction(event) {
	const file = event.target.files[0];
	if( file == undefined ) // if canceled
		return;
	const reader = new FileReader();
	reader.onload = function(event) { cyGraph = CyGraph.load(event.target.result); };
	reader.readAsText(file);
}

function reset(event){
	const states = cyGraph.fa.getStates();
	accept_result.value = "";
	getStateNode(getSelectedState()).unselect();
		states.forEach(state => getStateNode(state).style('background-color', null));
}
