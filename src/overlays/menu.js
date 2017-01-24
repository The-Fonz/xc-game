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

    _get_intro() {
        return `This is an introduction.`;
    }

    visible(bool: Boolean) {
        this.target.style.visibility = bool ? "visible" : "hidden";
    }

    render_missions(missions, callback) {
        let s = "";
        for (let i=0; i<missions.length; i++) {
            let mission = missions[i];
            s += `
                <div class="mission" data-menu-index="${i}">${mission.name}</div>
            `;
        }
        this._render(`${this._get_intro()} <div class="missionlist">${s}</div>`);
        // Attach click handlers
        for (let element of this.target.getElementsByClassName("mission")) {
            element.addEventListener('click', (ev) => {
                callback(missions[element.dataset.menuIndex]);
            });
        }
    }

    render_loading_mission(mission) {
        this._render(`Loading mission ${mission.name}...`);
    }

    render_playbtn(callback) {
        this._render(`<button id="menu-start-button">Play</button>`);
        document.getElementById("menu-start-button").
                 addEventListener('click', callback);
    }

}
