/*global jQuery: false _: false Backbone: false */

(function(global) {

  "use strict";

  // DOM の読み込みが完了する前に定義する

  var $ = global.jQuery,
    _ = global._,
    Backbone = global.Backbone;

  // アプリケーションの名前空間
  // テストのために外部に公開する
  var Todos = global.Todos = {};

  /////// TODO MODEL START ////////
  var Todo = Todos.Todo = Backbone.Model.extend({
    defaults: {
      done: false
    },

    initialize: function() {
      this.on("remove", function() {
        // model.unset(attribute, [options]) order属性を削除します。 
        // changeイベントが発生します。
        this.unset("order");
      }, this);
    },

    toggle: function() {
      // 項目のチェックボックスを押下したとき、done要素にtrue or false を登録する
      this.save({
        done: !this.get("done")
      });
    }
  });
  /////// TODO MODEL END ////////


  /////// TODO COLLECTION START ////////
  var TodoList = Todos.TodoList = Backbone.Collection.extend({

    // Todo model を コレクションで利用する
    model: Todo,

    // LocalStorage を使用する
    localStorage: new Backbone.LocalStorage("todos"),

    // Modelの特定の属性値で昇順にソートする場合は名前だけでよい
    comparator: "order",

    // Todo#defaultsからTodoList#nextOrderにアクセスせずにTodoListに追加
    // されるタイミングで付与するようにする。
    // Collectionにはset, reset, push, shiftなどのメソッドが定義されているが、
    // これらは全て内部でaddを使っている。
    add: function(models) {
      // models が配列ではなければ 配列を作成する
      if (!_.isArray(models)) models = [models];

      // _.each(list, iterator, [context])
      // models の配列それぞれに対して model が Todo のインスタンスであり、
      // order属性がnull もしくは undefined でないとき、
      // order属性の値を this.nextOrder() で更新します。
      _.each(models, function(model) {
        if (model instanceof Todo && !model.has('order')) {
          model.set('order', this.nextOrder());
          // もし、model が order属性を持っていなかったら modelのorder属性に
          // nextOrder() メソッドを呼び出しその値をセットします。
        } else if (!model.hasOwnProperty('order')) {
          model.order = this.nextOrder();
        }
      }, this);
      // Backbone.Collectionのaddメソッドをオーバーライドします。
      Backbone.Collection.prototype.add.apply(this, arguments);
    },

    // 完了しているTodoを返す
    done: function() {
      // "done: true" とマッチするインスタンスの配列を返します。  
      return this.where({
        done: true
      });
    },

    // 完了していないTodoを返す
    remaining: function() {
      // "done: false" とマッチするインスタンスの配列を返します。  
      return this.where({
        done: false
      });
    },

    nextOrder: function() {
      // インスタンスの数がfalse(つまり配列の長さ0) のとき　1 を返します。
      if (!this.length) return 1;
      // 配列の最後の要素のmodelからorder属性を取得し、その値に対し1をプラスします。
      return this.last().get("order") + 1;
    },

    // 順番入れ替え処理
    swap: function(idA, idB) {
      var tmp, modelA, modelB;
      modelA = this.get(idA);
      modelB = this.get(idB);
      if (modelA && modelB) {
        tmp = modelA.get('order');
        // 処理の実行を抑制するため silent: true オプションがついています。
        // これは、change イベントを抑制します。（発火させない）
        modelA.save('order', modelB.get('order'), {
          silent: true
        });
        modelB.save('order', tmp, {
          silent: true
        });
        this.sort();
      }
    }
  });
  /////// TODO COLLECTION END ////////

  var Todos = new TodoList();

  /////// TODO HELPER START ////////
  // ヘルパー関数
  // DOMセレクタを受け取って、それをUnderscoreテンプレート化したものを返す。
  // 同じセレクタの場合はキャッシュを使うので不要なDOMアクセスを抑制できる。
  var template = _.memoize(function(selector) {
    return _.template($(selector).html());
  });
  /////// TODO HELPER END ////////


  /////// TODO VIEW START //////// 
  var TodoView = Todos.TodoView = Backbone.View.extend({

    tagName: "li",

    moving: false, // ドラッグされているかどうか

    template: function(data) {
      // "#item-template"のdivタグを引数dataをもとに画面出力します。
      return template("#item-template")(data);
    },

    events: {
      // 項目リストの中のチェックボックスをクリックしたとき、 toggleDoneメソッドを実行します。  
      "click .toggle_ckbox": "toggleDone",

      // div の".view"クラスをダブルクリックしたとき、editメソッドを実行します。
      "dblclick .view": "edit",

      // destroy.png を押下したとき、clearメソッドを実行します。
      "click a.destroy": "clear",

      // ラベルをクリックして、編集モードになった編集項目にてキーボードのキー操作を行ったとき、
      // updateOnEnterメソッドを実行します。
      "keypress .edit": "updateOnEnter",

      // マウスのカーソルが、 編集項目からフォーカスが外れたとき、closeメソッドを実行します。
      "blur .edit": "close",

      // Todoをドラッグ・アンド・ドロップで並び替えられるようにする
      // drag を開始したとき、　onDragStartメソッドを実行します。
      "dragstart": "onDragStart",

      // drag を完了したとき、onDragEndメソッドを実行します。
      "dragend": "onDragEnd",

      // drag をdrop したとき、onDropメソッドを実行します。
      "drop": "onDrop",

      // drag要素が drop要素に重なっているとき、 onDragOverメソッドを実行します。
      "dragover": "onDragOver",
    },

    initialize: function() {
      console.log("TodoView 初期処理前");
      // Todo model が変更されたとき、　renderメソッドを実行します。
      this.listenTo(this.model, "change", this.render);

      // Todo model  が破棄されたとき、remove メソッドを実行します。
      this.listenTo(this.model, "destroy", this.remove);
      console.log("TodoView 初期処理後");
    },

    // ビューメソッド
    // --------------
    render: function() {
      console.log("TodoView render処理");
      // templateメソッドを実行して、画面表示します。
      this.$el.html(this.template(this.model.toJSON()));

      // このli以下のdoneクラスの要素を、this.model.get("done")の値で切り替えます。
      // toggleClass は jQueryのメソッドで、第一引数にcssクラス名を、第２引数に
      // true or false を渡します。　この場合、app.cssから li.done クラスが呼ばれ
      // 打ち消し線を表示します。
      this.$el.toggleClass("done", this.model.get("done"));
      this.input = this.$(".edit");
      console.log(this.el);
      return this;
    },

    // コントローラメソッド
    // --------------------
    toggleDone: function() {
      // Todo model の done要素に true もしくは　false を登録します。
      this.model.toggle();
    },

    edit: function() {
      // 編集モードにするため、app.cssからeditingクラスを読み込みます。
      this.$el.addClass("editing");
      this.input.focus();
    },

    close: function() {
      var value = this.input.val();
      if (!value) {
        this.clear();
      } else {
        this.model.save({
          title: value
        });
        this.$el.removeClass("editing");
      }
    },

    updateOnEnter: function(e) {
      // キーボードからリターンキーが押されたら closeします。
      if (e.keyCode == 13) this.close();
    },

    clear: function() {
      // データをサーバーから削除します。
      this.model.destroy();
    },

    onDragStart: function(e) {
      this.moving = true;
      // app.css から movingクラスを読み込む
      this.$el.addClass('moving');
      // ドラッグした要素のid をセーブするためにデータトランスファーオブジェクトにセットする。
      e.originalEvent.dataTransfer.setData('application/x-todo-id',
        this.model.id);
    },

    onDragEnd: function() {
      this.moving = false;
      this.$el.removeClass('moving');
    },

    onDrop: function(e) {
      e.preventDefault();
      // 自分自身へドロップした場合は何もしない
      if (!this.moving) {
        var id, model, tmp;
        id = e.originalEvent.dataTransfer.getData('application/x-todo-id');
        this.model.collection.swap(id, this.model.id);
      }
    },

    onDragOver: function(e) {
      // ドロップ可能にする
      e.preventDefault();
    }

  });
  /////// TODO VIEW END ////////


  /////// APP VIEW START ////////
  var AppView = Todos.AppView = Backbone.View.extend({

    el: "#todoapp",

    // ヘルパー関数を呼び出して、メモリから
    template: function(data) {
      return template("#stats-template")(data);
    },

    events: {
      // 項目追加のテキストで何かしらキーボードのキーが押されたら createOnEnter を実行する
      "keypress #new-todo": "createOnEnter",

      // "チェックした項目を削除"がクリックされたら、 clearCompleted を実行する
      "click #clear-completed": "clearCompleted",

      // "全てチェック"のラベル、もしくはチェックボックスがクリックされたら、 toggleAllComplete を実行する
      "click #toggle-all": "toggleAllComplete"
    },

    // 初期化処理
    initialize: function() {
      console.log("initialize処理開始");
      // もともとはグローバル変数だったTodosをcollectionプロパティに格納する。
      // これによりaddAllやclearCompletedなどのメソッド内でTodosの代わりに
      // Todosにアクセスするように変更できる。
      // TodoList を生成します。
      Todos = new TodoList();

      // 入力項目の値を取得し、input変数に格納します。
      this.input = this.$("#new-todo");

      // "全てチェック"項目のチェクボックスをallCheckbox変数に格納します。
      this.allCheckbox = this.$("#toggle-all")[0];

      // todo-list をlist変数に格納します。
      this.list = this.$("#todo-list");

      // このコレクションの配列にmodel要素が追加されたら、addOneメソッドを実行します。
      this.listenTo(Todos, 'add', this.addOne);

      this.listenTo(Todos, 'reset', this.addAll);

      // 本来はここにresetイベントの購読が行われているが、Backbone1.0から
      // Collection#fetchがsetをデフォルトで使うようになったので削除した。
      // このコレクションの全てのイベントに対して、renderメソッドを実行します。
      this.listenTo(Todos, "all", this.render);

      // このコレクションのソートイベントに対して、reorderメソッドを実行します。
      this.listenTo(Todos, "sort", this.reorder);

      this.footer = this.$(".foot");
      this.main = $("#main");

      // サーバーからコレクションを取得します。
      // fetch()はデータを取り出して属性を更新するメソッドです。
      // 取得したデータを現在の属性が異なる場合は更新して"change"イベントを発生させます。
      console.log("fetch前");
      Todos.fetch();
      console.log("fetch後");
      console.log("this collection : " + JSON.stringify(Todos.toJSON()));
    },

    // ビューメソッド
    // --------------
    render: function() {
      console.log("AppView render 処理開始");
      // "done: true"のTodo model の配列の数を取得します。
      var done = Todos.done().length;

      // "done: false"のTodo model の配列の数を取得します。
      var remaining = Todos.remaining().length;
      console.log("collection の長さ = " + Todos.length);
      // このコレクションが配列として要素があれば
      if (Todos.length) {
        console.log("#mainの中のhtml は 次の通り　" + this.main.html());
        // "#main"のdiv 要素を画面に表示します。
        this.main.show();
        // "#footer"のdiv要素を画面に表示します。
        this.footer
          .show()
          .html(this.template({
            done: done,
            remaining: remaining
          }));
      } else {
        console.log("hide処理前");
        this.main.hide();
        this.footer.hide();
        console.log("hide処理後");
      }

      // remaining == 0 のとき true, それ以外は false
      this.allCheckbox.checked = !remaining;
      console.log("AppView render 処理後");
    },

    addOne: function(todo) {
      console.log("addOne処理開始");
      var view = new TodoView({
        model: todo
      });
      this.list.append(view.render().el);
    },

    reorder: function() {
      console.log("reorder処理開始");
      console.log(this.list.html());
      this.list.html('');
      this.addAll();
    },

    // コントローラメソッド
    // --------------------
    addAll: function() {
      console.log("addAll処理開始");
      Todos.each(this.addOne, this);
    },

    createOnEnter: function(e) {
      console.log("createOnEnter処理開始");
      var value = this.input.val();
      if (e.keyCode !== 13) return;
      if (!value) return;

      // 15件までの仕様のため処理追加
      if(Todos.length >= 15) return;

      Todos.create({
        title: value
      });
      // コントローラメソッド内でビューを変更しているが、これくらいは許容。
      // もっと込み入ってくるのであればclearInputメソッドを作って、それを
      // 実行するようにする。
      this.input.val("");
    },

    clearCompleted: function() {
      console.log("clearCompleted処理開始");
      _.invoke(Todos.done(), "destroy");
      return false;
    },

    toggleAllComplete: function() {
      console.log("toggleAllComplete処理開始");
      var done = this.allCheckbox.checked;
      Todos.each(function(todo) {
        todo.save({
          done: done
        });
      });
    }

  });
  /////// APP VIEW END ////////


  $(function() {

    // DOM の準備が整ったらアプリを起動
    new AppView();

  });

})(this);