// ==UserScript==
// @name         解除创作中心稿件对比数量限制
// @match        https://member.bilibili.com/york/data-center-web*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  'use strict';
  const MAX = 200;

  // 扩大对比请求的返回数量
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...args) {
    if (typeof url === 'string' && url.includes('/archive_diagnose/compare')) {
      const request = new URL(url, location.href);
      request.searchParams.set('size', String(MAX));
      url = request.href;
    }
    return originalOpen.call(this, method, url, ...args);
  };

  const patched = new WeakSet();
  const processedOpening = new WeakSet();
  const busy = new WeakSet();

  function visit(vm) {
    if (!vm) return;
    const state = vm._setupState;

    if (state?.__sfc && state.candidates && state.arcsSelected &&
      typeof state.handleQueue === 'function' &&
      typeof state.loadMoreCandidates === 'function') {

      // 允许之后继续手动增减，而不是在第10个时被拦截
      if (!patched.has(vm)) {
        patched.add(vm);
        state.handleQueue = item => {
          const selected = state.arcsSelected.value.slice();
          const index = selected.indexOf(item.bvid);
          if (index !== -1) selected.splice(index, 1);
          else if (selected.length < MAX) selected.push(item.bvid);
          state.arcsSelected.value = selected;
        };
      }

      if (!state.props.visible) {
        processedOpening.delete(vm); // 下次打开时可重新执行
      } else if (!processedOpening.has(vm) && !busy.has(vm) &&
        state.candidates.value.data.length) {
        busy.add(vm);
        (async () => {
          try {
            while (state.props.visible &&
              state.candidates.value.data.length < MAX &&
              state.candidates.value.data.length < state.candidates.value.page.total) {
              const before = state.candidates.value.data.length;
              await state.loadMoreCandidates();
              if (state.candidates.value.data.length <= before) break;
            }

            if (!state.props.visible) return;
            state.arcsSelected.value = [
              ...new Set([
                ...state.arcsSelected.value,
                ...state.candidates.value.data.map(item => item.bvid)
              ])
            ].slice(0, MAX);
            processedOpening.add(vm);
            console.info(`[稿件对比] 已选中 ${state.arcsSelected.value.length} 个稿件，请检查后点击“确定”`);
          } catch (error) {
            console.error('[稿件对比] 自动选择失败', error);
          } finally {
            busy.delete(vm);
          }
        })();
      }
    }

    for (const child of vm.$children || []) visit(child);
  }

  setInterval(() => visit(document.querySelector('#app')?.__vue__), 500);
})();