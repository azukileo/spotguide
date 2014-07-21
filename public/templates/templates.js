(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['thread'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        ";
  stack1 = helpers.each.call(depth0, depth0.replies, {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      ";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n          <aside>\n            <div id=\"reply\">\n              <div id=\"reply_header\">\n                <img src=\"img/br.png\" alt=\"\">\n                Currytibia (OP) ";
  if (stack1 = helpers.create_date) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.create_date; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " No. 20774959\n                <div class=\"right\">\n                  ";
  if (stack1 = helpers.good) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.good; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n                  <img src=\"img/good.png\" alt=\"\">\n                  <img src=\"img/bad.png\" alt=\"\">";
  if (stack1 = helpers.bad) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.bad; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n                  <img src=\"img/garbage.png\" alt=\"\">\n                </div>\n              </div>\n              <img id=\"reply_image\" src=\"img/forest-thumb.jpg\" alt=\"\">\n              <p>\n                ";
  if (stack1 = helpers.comment) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.comment; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n              </p>\n            </div>\n          </aside>\n        ";
  return buffer;
  }

  buffer += "<article>\n  <div id=\"col\">\n    <div id=\"imageboard_title\">";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n    <div id=\"imageboard_header\">\n      <img src=\"img/br.png\" alt=\"\">\n      Currytibia (OP) ";
  if (stack1 = helpers.create_date) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.create_date; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " No. 20774959\n      <div class=\"right\">\n        ";
  if (stack1 = helpers.good) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.good; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n        <img src=\"img/good.png\" alt=\"\">\n        <img src=\"img/bad.png\" alt=\"\">";
  if (stack1 = helpers.bad) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.bad; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n        <img src=\"img/garbage.png\" alt=\"\">\n      </div>\n    </div>\n    <div id=\"imageboard\">\n      <img id=\"reply_image\" src=\"img/sunflower-thumb.jpg\" alt=\"\">\n      <p>\n        ";
  if (stack1 = helpers.comment) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.comment; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n      </p>\n      ";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.replies),stack1 == null || stack1 === false ? stack1 : stack1.length), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    </div>\n  </div>\n</article>";
  return buffer;
  });
})();