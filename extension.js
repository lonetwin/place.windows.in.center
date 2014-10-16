const Lang = imports.lang;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;

let _workspaceAddedSignal;

let _signals = [];

function _onWindowAdded(workspace, win) {
	let actor = win.get_compositor_private();
	if (!actor) {
		Mainloop.idle_add(Lang.bind(this, function () {
			this._onWindowAdded(workspace, win);
		}));
	} else {
		this._placeWindow(win);
	}
}

function _placeWindow(win) {
	if (win == null) return;
	/* 0 = Normal Window, 3 = (non-modal) dialog */
	if (win.get_window_type() == 0 || win.get_window_type() == 3) {
		//let rect = win.get_frame_rect();//Used in 3.12.2
		let rect = win.get_outer_rect();//Used in 3.10.4

		let monitor = Main.layoutManager.monitors[global.screen.get_current_monitor()];
		let x = monitor.x;
		let y = monitor.y;

		if (!win.maximized_horizontally && !win.maximized_vertically) {
			x += Math.floor((monitor.width - rect.width) / 2);
			y += Math.floor((monitor.height - rect.height) / 2);
		} else if (win.maximized_horizontally && !win.maximized_vertically) {
			y += Math.floor((monitor.height - rect.height) / 2);
		} else if (!win.maximized_horizontally && win.maximized_vertically) {
			x += Math.floor((monitor.width - rect.width) / 2);
		}

		if (win.decorated) {
			win.move_frame(true, x, y);
		} else {
			win.move(true, x, y);
		}
	}
}

function _onWorkspaceAdded() {
	this._onDisconnectSignals();
	let workspace;
	for (let i = 0; i < global.screen.n_workspaces; i++) {
		workspace = global.screen.get_workspace_by_index(i);
		this._signals.push(workspace.connect('window-added', Lang.bind(this, this._onWindowAdded)));
	}
}

function _onDisconnectSignals() {
	for (let i = 0; i < this._signals.length; i++) {
		global.screen.disconnect(this._signals[i]);
		this._signals[i] = 0;
	}
	this._signals = [];
}

function init() {}

function enable() {
	this.workspaceAddedId = global.screen.connect('workspace-added', Lang.bind(this, this._onWorkspaceAdded));
	this._onWorkspaceAdded();
};

function disable() {
	global.screen.disconnect(workspaceAddedId);
	this._onDisconnectSignals();
};
