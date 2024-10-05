import { fetchResource } from './utils.min.js';

/*-----------------------------------------------------------------------------------------*/
/*-------------------------------- PRIVATE PROPERTIES -------------------------------------*/
/*-----------------------------------------------------------------------------------------*/

const _baseStyle = `
    :host{
        position: fixed;
        z-index: 99999;
        inset-block-end: 0;
        inset-inline: 0;
        //padding-block-end: 5vh;
        max-height: min-content;

        display: grid;
        justify-items: center;
        justify-content: center;
        gap: 1vh;     
        
        pointer-events: none;
        background: transparent;

        top: 0;
    }

    :host * {
        box-sizing: border-box;
        margin: 0
    }

    :host output {
        max-inline-size: min(65ch, 90vw);
        padding-block: .5ch;
        padding-inline: 1ch;
        padding: 15px 20px 15px 40px;
        border: solid 1px #eee;
        border-radius: 4px;
        box-shadow: 0 6px 10px 0 rgb(0 0 0 / 14%), 0 1px 18px 0 rgb(0 0 0 / 12%), 0 3px 5px -1px rgb(0 0 0 / 30%);
        font-size: 1.2rem;        
        font-weight: bold;
        background-position: 10px center;
        background-size: 20px;
        background-repeat: no-repeat; 
        background-color: #FFF;

        will-change: transform, opacity;
        opacity: 0;
        margin: 0;
        transform: translateY(-110%);
        transition: transform .3s ease .5s, opacity 1.5s ease .3s , margin .3s linear .3s;

        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 4;
        overflow: hidden;

        color: #000;
    }
    
    :host output.show {    
        opacity: 1;
        transform: translateY(0);
        margin-top: 20px
    }

    :host output.error {    
        background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIzIDMgMTYgMTYiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeTI9Ii0yLjYyMyIgeDI9IjAiIHkxPSI5ODYuNjciPjxzdG9wIHN0b3AtY29sb3I9IiNmZmNlM2IiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmQ3NjIiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHkxPSI5ODYuNjciIHgyPSIwIiB5Mj0iLTIuNjIzIj48c3RvcCBzdG9wLWNvbG9yPSIjZmZjZTNiIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmVmNGFiIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgyPSIxIiB4MT0iMCIgeGxpbms6aHJlZj0iIzAiLz48L2RlZnM+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMiAwIDAgMi0xMS0yMDcxLjcyKSI+PHBhdGggdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNyAxMDM3LjM2KSIgZD0ibTQgMGMtMi4yMTYgMC00IDEuNzg0LTQgNCAwIDIuMjE2IDEuNzg0IDQgNCA0IDIuMjE2IDAgNC0xLjc4NCA0LTQgMC0yLjIxNi0xLjc4NC00LTQtNCIgZmlsbD0iI2RhNDQ1MyIvPjxwYXRoIGQ9Im0xMS45MDYgMTA0MS40NmwuOTktLjk5Yy4wNjMtLjA2Mi4wOTQtLjEzOS4wOTQtLjIyOSAwLS4wOS0uMDMxLS4xNjYtLjA5NC0uMjI5bC0uNDU4LS40NThjLS4wNjMtLjA2Mi0uMTM5LS4wOTQtLjIyOS0uMDk0LS4wOSAwLS4xNjYuMDMxLS4yMjkuMDk0bC0uOTkuOTktLjk5LS45OWMtLjA2My0uMDYyLS4xMzktLjA5NC0uMjI5LS4wOTQtLjA5IDAtLjE2Ni4wMzEtLjIyOS4wOTRsLS40NTguNDU4Yy0uMDYzLjA2My0uMDk0LjEzOS0uMDk0LjIyOSAwIC4wOS4wMzEuMTY2LjA5NC4yMjlsLjk5Ljk5LS45OS45OWMtLjA2My4wNjItLjA5NC4xMzktLjA5NC4yMjkgMCAuMDkuMDMxLjE2Ni4wOTQuMjI5bC40NTguNDU4Yy4wNjMuMDYzLjEzOS4wOTQuMjI5LjA5NC4wOSAwIC4xNjYtLjAzMS4yMjktLjA5NGwuOTktLjk5Ljk5Ljk5Yy4wNjMuMDYzLjEzOS4wOTQuMjI5LjA5NC4wOSAwIC4xNjYtLjAzMS4yMjktLjA5NGwuNDU4LS40NThjLjA2My0uMDYyLjA5NC0uMTM5LjA5NC0uMjI5IDAtLjA5LS4wMzEtLjE2Ni0uMDk0LS4yMjlsLS45OS0uOTkiIGZpbGw9IiNmZmYiLz48L2c+PC9zdmc+");        
        border-left: solid 8px #ff4757;
        background-color: #ffe0e3;
    }
    :host output.success {    
        background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNjQgNjQiPjxjaXJjbGUgY3g9IjMyIiBjeT0iMzIiIHI9IjMwIiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTMyLDJDMTUuNDMxLDIsMiwxNS40MzIsMiwzMmMwLDE2LjU2OCwxMy40MzIsMzAsMzAsMzBjMTYuNTY4LDAsMzAtMTMuNDMyLDMwLTMwQzYyLDE1LjQzMiw0OC41NjgsMiwzMiwyeiBNMjUuMDI1LDUwCglsLTAuMDItMC4wMkwyNC45ODgsNTBMMTEsMzUuNmw3LjAyOS03LjE2NGw2Ljk3Nyw3LjE4NGwyMS0yMS42MTlMNTMsMjEuMTk5TDI1LjAyNSw1MHoiIGZpbGw9IiM0M2EwNDciLz48L3N2Zz4K");
        border-left: solid 8px #2ed573;
        background-color: #c3f3d7;
    }        
    :host output.info {    
        background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAyMDAxMDkwNC8vRU4iDQogImh0dHA6Ly93d3cudzMub3JnL1RSLzIwMDEvUkVDLVNWRy0yMDAxMDkwNC9EVEQvc3ZnMTAuZHRkIj4NCjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjAiIHZpZXdCb3g9IjAgMCA4ODYuMDAwMDAwIDg4Ny4wMDAwMDAiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+DQo8bWV0YWRhdGE+DQpDcmVhdGVkIGJ5IHBvdHJhY2UgMS4xNSwgd3JpdHRlbiBieSBQZXRlciBTZWxpbmdlciAyMDAxLTIwMTcNCjwvbWV0YWRhdGE+DQo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAwMDAwMCw4ODcuMDAwMDAwKSBzY2FsZSgwLjEwMDAwMCwtMC4xMDAwMDApIiBmaWxsPSIjMDA3MGMwIiBzdHJva2U9Im5vbmUiPg0KPHBhdGggZD0iTTQwMzcgODg1NCBjLTU1MyAtNTIgLTEwMzggLTE4NSAtMTUxNSAtNDE1IC0yMzQgLTExMiAtMzI3IC0xNjUgLTU0MSAtMzA3IC00OTMgLTMyNyAtOTAzIC03MzQgLTEyMzMgLTEyMjcgLTQwMCAtNTk3IC02MzUgLTEyMzkgLTcyNSAtMTk3NSAtMTQgLTExMyAtMTggLTIyMSAtMTggLTQ5NSAwIC0zNzUgOSAtNDg1IDYxIC03ODUgMjA0IC0xMTcyIDg5NSAtMjIzMiAxODk0IC0yOTAyIDU5NyAtNDAwIDEyMTcgLTYyOSAxOTY1IC03MjUgMjAxIC0yNiA4MDcgLTI2IDEwMTAgMCA3OTMgMTAxIDE0ODAgMzY4IDIwODkgODEwIDg2MyA2MjYgMTQ2NiAxNTIzIDE3MTUgMjU1MSA0NCAxNzkgNzEgMzMyIDk4IDU0MSAyNiAyMDMgMjYgODA2IDAgMTAyMCAtMTI0IDEwMTQgLTU2MSAxOTE3IC0xMjczIDI2MjkgLTY5MiA2OTIgLTE2MTAgMTE0NCAtMjU1OSAxMjYwIC0zMTYgMzkgLTY5MSA0NyAtOTY4IDIweiBtNjczIC0xMDE0IGMyODUgLTgyIDQyMCAtMjc0IDQyMCAtNTk1IDAgLTM0MSAtMTYzIC01NTIgLTQ3OCAtNjE3IC0xMjkgLTI3IC0zODggLTIxIC00OTcgMTAgLTIyMCA2NSAtMzM0IDE3MiAtMzk3IDM3MiAtMjAgNjUgLTIzIDk2IC0yMyAyMzAgMCAxNzMgMTcgMjUzIDc3IDM1OCA2OSAxMjIgMjEwIDIxNSAzODMgMjUyIDEyNyAyOCA0MDQgMjMgNTE1IC0xMHogbTM2MCAtNDE2NSBsMCAtMjM1NSAtNjQ1IDAgLTY0NSAwIDAgMjM0OCBjMCAxMjkyIDMgMjM1MiA3IDIzNTUgMyA0IDI5NCA3IDY0NSA3IGw2MzggMCAwIC0yMzU1eiIvPg0KPC9nPg0KPC9zdmc+");
        border-left: solid 8px #71c9ff;
        background-color: #d7f0ff;
    }
    :host output.warning {    
        background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDgiPgogPHBhdGggCiAgICAgc3R5bGU9ImZpbGw6I2Y0Nzc1MDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZSIgCiAgICAgZD0iTSA0IDAgQyAzLjc5NjQ4MzUgMC4wMDAyNTMxNTkxNyAzLjY0NDY3OCAwLjA5NjQ5MTI0IDMuNTM3MTA5NCAwLjMxMjUgQyAzLjUzNzEwOTQgMC4zMTI1IDAuMDc3MjQ2NTM1IDcuMjAwNTk2IDAuMDgwMDc4MTI1IDcuMjI4NTE1NiBDIDAuMDQzNDE3NTA1IDcuMzA1NTAxNiAtMS4yNDU2NjMyZS0wNSA3LjQwMzY4MSAwIDcuNSBDIDAgNy43NzYxNDI0IDAuMjIzODU3NjMgOCAwLjUgOCBMIDcuNSA4IEMgNy43NzYxNDI0IDggOCA3Ljc3NjE0MjQgOCA3LjUgQyA4LjAwMDIwMjEgNy4zODczMzgzIDcuOTgxODgwOCA3LjM2Nzc1MzggNy44OTI1NzgxIDcuMTg5NDUzMSBMIDQuNDU1MDc4MSAwLjI5MTAxNTYyIEMgNC4zNDYwMDEgMC4wOTc3NDEzOTUgNC4xOTU1NDkxIC0wLjAwMDMzMTI4ODAxIDQgMCB6ICIKICAgICAvPgogPHBhdGggCiAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZSIgCiAgICAgZD0iTSAzLjUgMiBMIDMuNSA1IEwgNC41IDUgTCA0LjUgMiBMIDMuNSAyIHogTSAzLjUgNiBMIDMuNSA3IEwgNC41IDcgTCA0LjUgNiBMIDMuNSA2IHogIgogICAgIC8+Cjwvc3ZnPgo=");
        border-left: solid 8px #ffa502;
        background-color: #ffdb9b;
    }

`;

/*---------------------------------------------------------------------------------------*/
export default class Notifications extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  /*---------------------------------------------------------------------------------------*/

  connectedCallback() {
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(_baseStyle));
    this.shadowRoot.insertBefore(style, this.shadowRoot.firstChild); //prepend
  }

  /*---------------------------------------------------------------------------------------*/

  add(text, type = 'info') {
    fetchResource(
      './scripts/lib/domPurify/3.0.6/dompurify.min.js',
      'js',
      'dompurify',
    ).then(() => {
      const prev = this.shadowRoot.querySelector(
        `output[aria-label="${DOMPurify.sanitize(text)}"]`,
      );
      if (prev) return false;

      const el = document.createElement('output');
      el.innerHTML = DOMPurify.sanitize(text);
      el.setAttribute('aria-live', 'assertive');
      el.setAttribute('aria-atomic', 'true');
      el.setAttribute('aria-relevant', 'additions');
      el.setAttribute('aria-label', text);
      el.setAttribute('role', 'alert');
      if (type && ['error', 'warning', 'info', 'success'].includes(type))
        el.classList.add(type);

      this.shadowRoot.appendChild(el);

      setTimeout(() => el.classList.add('show'), 50);

      setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 1000); //transitionend may fail
      }, 7000);
    });
  }
}

/*---------------------------------------------------------------------------------------*/

if (!customElements.get('ui-notifications')) {
  customElements.define('ui-notifications', Notifications);
}
