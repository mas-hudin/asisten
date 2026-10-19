/**
 * EMBED WIDGET GENERATOR & FLOATING CHATBOT WIDGET
 * Memungkinkan sekolah memasang robot AI ini di website sekolah mana pun (WordPress, Web Sekolah, CMS)
 */

const EmbedHelper = {
  getIframeCode(targetUrl) {
    const url = targetUrl || window.location.href.replace(/index\.html.*/, 'widget.html');
    return `<!-- KODE ROBOT AI SEKOLAH (Floating Widget) -->
<div id="school-ai-widget-container" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
  <iframe 
    src="${url}" 
    style="width: 420px; height: 650px; border: none; border-radius: 20px; box-shadow: 0 10px 40px rgba(0, 240, 255, 0.25); background: transparent;"
    allow="microphone; camera; clipboard-write;"
    title="School AI Assistant">
  </iframe>
</div>`;
  },

  getFloatingButtonCode(targetUrl) {
    const url = targetUrl || window.location.href.replace(/index\.html.*/, 'widget.html');
    return `<!-- SCRIPT POPUP ROBOT AI SEKOLAH -->
<script>
(function() {
  var btn = document.createElement('div');
  btn.id = 'school-ai-launcher';
  btn.innerHTML = '<div style="position:fixed;bottom:25px;right:25px;width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg, #00f0ff, #8b5cf6);box-shadow:0 0 25px rgba(0,240,255,0.6);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:999999;transition:all 0.3s ease;"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path><rect x="4" y="6" width="16" height="12" rx="2"></rect><circle cx="9" cy="12" r="1.5"></circle><circle cx="15" cy="12" r="1.5"></circle><path d="M10 16h4"></path></svg></div>';
  
  var frame = document.createElement('iframe');
  frame.src = '${url}';
  frame.style.cssText = 'position:fixed;bottom:105px;right:25px;width:420px;height:620px;max-width:92vw;max-height:85vh;border:none;border-radius:24px;box-shadow:0 15px 50px rgba(0,0,0,0.5), 0 0 30px rgba(0,240,255,0.3);z-index:999998;display:none;transition:all 0.3s ease;';
  frame.allow = 'microphone; camera; clipboard-write;';

  document.body.appendChild(btn);
  document.body.appendChild(frame);

  var isOpen = false;
  btn.onclick = function() {
    isOpen = !isOpen;
    frame.style.display = isOpen ? 'block' : 'none';
  };
})();
<\/script>`;
  }
};

window.EmbedHelper = EmbedHelper;
