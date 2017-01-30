/*
 * Shows menu, has methods to show, hide etc.
 */


export class Menu {

    constructor(targetid) {
        this.target = document.getElementById(targetid);
    }

    _render(str) {
        this.target.innerHTML = str;
    }

    set_title(s) {
        this.title = s;
    }

    set_intro(s) {
        this.intro = s;
    }

    _get_text() {
        return `${this.title} ${this.intro}`;
    }

    visible(bool: Boolean) {
        this.target.style.visibility = bool ? "visible" : "hidden";
    }

    render_missions(missions, callback) {
        let s = "";
        for (let i=0; i<missions.length; i++) {
            let mission = missions[i];
            // Use background thumbnail if defined
            let style = mission.thumbnail ? `background-image: url(${mission.thumbnail});` : '';
            s += `
                <div class="mission" data-menu-index="${i}" style="${style}">
                    <div class="overlay-title vcenter">${mission.name}</div>
                </div>
            `;
        }
        this._render(`${this._get_text()} <div class="missionlist">${s}</div>`);
        // Attach click handlers
        let mission_elems = this.target.getElementsByClassName("mission");
        for (let i=0; i<mission_elems.length; i++) {
            mission_elems[i].addEventListener('click', (ev) => {
                callback(missions[mission_elems[i].dataset.menuIndex]);
            });
        }
    }

    render_loading_mission(mission) {
        this._render(`<div class="vcenter">Loading mission...</div>`);
    }

    render_playbtn(callback) {
        this._render(`<button class="vcenter" id="menu-start-button">Play</button>`);
        document.getElementById("menu-start-button").
                 addEventListener('click', callback);
    }

}
