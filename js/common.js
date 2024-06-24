// ディープコピー
function deepClone(instance) {
  // インスタンスがnullまたはundefinedの場合、そのまま返す
  if (instance === null || instance === undefined) return instance;

  // プリミティブ型の場合、そのまま返す
  if (typeof instance !== 'object') return instance;

  // 特殊なオブジェクト型の場合
  if (instance instanceof Date) return new Date(instance);
  if (instance instanceof RegExp) return new RegExp(instance);
  if (instance instanceof Map) return new Map(instance);
  if (instance instanceof Set) return new Set(instance);

  // インスタンスがArrayの場合の処理
  if (Array.isArray(instance)) {
    return instance.map(item => deepClone(item));
  }

  // インスタンスのクラスを取得
  const ClonedClass = instance.constructor;
  // 新しいインスタンスを作成
  const clone = new ClonedClass();

  // プロパティを再帰的にコピー
  for (let key of Object.keys(instance)) {
    clone[key] = deepClone(instance[key]);
  }

  return clone;
}

// キャラ名取得
function getCharaData(chara_id) {
  const filtered_name = chara_data.filter((obj) => obj.chara_id == chara_id);
  return filtered_name.length > 0 ? filtered_name[0] : undefined;
}

// Safari判定
function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

// アイテム非表示
function toggleItemVisibility(selector, shouldShow) {
  $(selector).each(function () {
    if ($(this).is('option')) {
      if (shouldShow) {
        $(this).showOption();
      } else {
        $(this).hideOption();
      }
    } else {
      // option以外は表示/非表示切り替え
      $(this).toggle(shouldShow);
    }
  });
}

$.fn.showOption = function () {
  this.each(function () {
    if (this.tagName == "OPTION") {
      var opt = this;
      if ($(this).parent().get(0).tagName == "SPAN") {
        var span = $(this).parent().get(0);
        $(span).replaceWith(opt);
        $(span).remove();
      }
      opt.disabled = false;
      $(opt).show();
    }
  });
  return this;
}
$.fn.hideOption = function () {
  this.each(function () {
    if (this.tagName == "OPTION") {
      var opt = this;

      // 選択状態を解除
      if (opt.selected) {
        $(opt).prop('selected', false);

        // 他のオプションを選択状態にする（必要に応じて）
        var select = $(opt).closest('select');
        if (select.length > 0) {
          select.val(select.find('option').not(opt).first().val());
        }
      }
      if ($(this).parent().get(0).tagName == "SPAN") {
        var span = $(this).parent().get(0);
        $(span).hide();
      } else {
        $(opt).wrap("<span>").hide();
      }
      opt.disabled = true;
    }
  });
  return this;
}