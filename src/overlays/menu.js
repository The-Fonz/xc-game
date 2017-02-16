/*
 * Shows menu, has methods to show, hide etc.
 */

import random from 'lodash/random';

const HIP_LOADING_MESSAGES = [
    "Building mountains...",
    "Retrieving vectors...",
    "Generating triangles...",
    "Planting trees...",
    "Picking turnpoints...",
    "Setting time interval...",
];

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
    /** Set css visibility attribute, or return visibility bool if no arg */
    visible(bool: Boolean) {
        if (bool === undefined)
            // Is probably visible if any other value than 'hidden'
            return this.target.style.visibility === "hidden" ? false: true;
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
        let msg = () => {
            // Stop if start button shown
            if (this.readyToPlay) return;
            // Random choice from hip messages
            let randindex = random(0, HIP_LOADING_MESSAGES.length);
            let hipmsg = HIP_LOADING_MESSAGES[randindex];
            this._render(`<div class="vcenter">${hipmsg}</div>`);
            // Draw different message every second
            window.setTimeout(msg, 1000);
        };
        msg();
    }

    render_playbtn(callback) {
        this._render(`<button class="vcenter" id="menu-start-button">Play</button>`);
        document.getElementById("menu-start-button").
                 addEventListener('click', callback);
        this.readyToPlay = true;
    }

}
