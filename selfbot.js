// educational content only — selfbot violates Discord TOS

let ws = null;
let seq = 0;
let heartbeatTimer = null;
let sessionId = null;
const noSleep = new NoSleep();

const log = (msg) => {
  const el = document.getElementById('log');
  el.textContent += `[${new Date().toLocaleTimeString()}] ${msg}\n`;
  el.scrollTop = el.scrollHeight;
};

async function connect() {
  const token = document.getElementById('token').value.trim();
  if (!token) return log('Token field empty dumbass');

  log('Attempting connection...');
  noSleep.enable();

  // Latest known mobile-like identify payload — update build_number often
  const identify = {
    op: 2,
    d: {
      token,
      capabilities: 509,
      properties: {
        os: "Android",
        browser: "Chrome",
        device: "Pixel 8",
        system_locale: "en-US",
        browser_user_agent: navigator.userAgent,
        browser_version: "124.0",
        os_version: "14",
        referrer: "",
        client_build_number: 999999,          // <-- REPLACE WITH REAL NUMBER FROM DISCORD NETWORK TAB
        release_channel: "stable",
        client_event_source: null,
        client_version: "1.0.9160"           // fake but close
      },
      compress: false,
      client_state: {
        api_code_version: 1,
        guild_versions: {},
        highest_last_message_id: "0",
        private_channels_version: "0",
        read_state_version: 0,
        user_guild_settings_version: -1,
        user_settings_version: -1
      }
    }
  };

  ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

  ws.onopen = () => {
    log('WebSocket opened — sending identify');
    ws.send(JSON.stringify(identify));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.op === 10) {
      const interval = data.d.heartbeat_interval;
      log(`Heartbeat every \~${interval/1000}s`);
      heartbeatTimer = setInterval(() => {
        ws.send(JSON.stringify({op: 1, d: seq}));
      }, interval * 0.92); // slight jitter to look human
    }

    if (data.op === 0) {
      seq = data.s;
      if (data.t === 'READY') {
        log(`Logged in as \( {data.d.user.username}# \){data.d.user.discriminator}`);
        log(`Session ID: ${data.d.session_id}`);
        sessionId = data.d.session_id;
      }
      if (data.t === 'RESUMED') {
        log('Session resumed — still alive');
      }
    }

    if (data.op === 7 || data.op === 9) {
      log('Gateway wants reconnect / invalidate — token likely fucked');
      ws.close();
    }
  };

  ws.onclose = (e) => {
    log(`Disconnected — code ${e.code}`);
    clearInterval(heartbeatTimer);
    noSleep.disable();
  };

  ws.onerror = (err) => {
    log('WebSocket error: ' + err.message);
  };
}

function runCommand(input) {
  if (!input.startsWith('.')) return;
  const cmd = input.slice(1).trim().split(' ')[0].toLowerCase();

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    log('Not connected dipshit');
    return;
  }

  log(`Running .${cmd}`);

  if (cmd === 'help') {
    log('Available: .ping, .say <text>, .typing, .help');
  }
  else if (cmd === 'ping') {
    log('Pong bitch');
  }
  else if (cmd === 'say') {
    const text = input.slice(1 + cmd.length + 1).trim();
    if (text) log(`Would say: ${text} (sending not implemented yet)`);
  }
  else if (cmd === 'typing') {
    log('Fake typing started (not sent yet)');
  }
  else {
    log(`Unknown command .${cmd}`);
  }
        }
