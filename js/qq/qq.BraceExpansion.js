// (MIT)
// Copyright (c) 2013 Julian Gruber <julian@juliangruber.com>
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

//https://github.com/isaacs/brace-expansion
// b36642758895654e8a4df9c98cf42670a9829324
//  Jul 19, 2016

// uses qq.BalancedMatch

/* this check and creation of the 'qq' object */
try
{
  if(qq == null)
  {
    qq = {};
  }
}
catch(e)
{
  var qq = {};
}

/* qq BraceExpansion module */
(function (qq) {
  
  try
  {
    console.log("- injected qq.BraceExpansion.js");
  }
  catch(e)
  {
    alert("didn't inject qq.BraceExpansion.js");
  }
  
  var root = null,
    _isNode = false;
  
  try
  {
    if(typeof module !== 'undefined' && module.exports)
    {
      root = this;
      
      module.exports = function (qqref)
      {
        if(qqref != null)
        {
          qq = qqref;
        }

        registerBraceExpansion(qq);
        
        return qq;
      };

      _isNode = true;
      
    }
    else
    {
      root = window;
      
      root.qq = qq;
    }
  }
  catch(e)
  {
    var qq = {};
  }

  var escSlash = '\0SLASH'+Math.random()+'\0';
  var escOpen = '\0OPEN'+Math.random()+'\0';
  var escClose = '\0CLOSE'+Math.random()+'\0';
  var escComma = '\0COMMA'+Math.random()+'\0';
  var escPeriod = '\0PERIOD'+Math.random()+'\0';

  var numeric = function(str)
  {
    return parseInt(str, 10) == str
      ? parseInt(str, 10)
      : str.charCodeAt(0);
  };

  var escapeBraces = function(str)
  {
    return str.split('\\\\').join(escSlash)
              .split('\\{').join(escOpen)
              .split('\\}').join(escClose)
              .split('\\,').join(escComma)
              .split('\\.').join(escPeriod);
  };

  var unescapeBraces = function(str)
  {
    return str.split(escSlash).join('\\')
              .split(escOpen).join('{')
              .split(escClose).join('}')
              .split(escComma).join(',')
              .split(escPeriod).join('.');
  };


  // Basically just str.split(","), but handling cases
  // where we have nested braced sections, which should be
  // treated as individual members, like {a,{b,c},d}
  var parseCommaParts = function(str)
  {
    if (!str)
    {
      return [''];
    }

    var parts = [];
    var m = qq.balanced('{', '}', str);

    if(!m)
    {
      return str.split(',');
    }

    var pre = m.pre;
    var body = m.body;
    var post = m.post;
    var p = pre.split(',');

    p[p.length-1] += '{' + body + '}';

    var postParts = parseCommaParts(post);

    if(post.length)
    {
      p[p.length-1] += postParts.shift();
      p.push.apply(p, postParts);
    }

    parts.push.apply(parts, p);

    return parts;
  }

  var expandTop = function (str)
  {
    if(!str)
    {
      return [];
    }

    // I don't know why Bash 4.3 does this, but it does.
    // Anything starting with {} will have the first two bytes preserved
    // but *only* at the top level, so {},a}b will not expand to anything,
    // but a{},b}c will be expanded to [a}c,abc].
    // One could argue that this is a bug in Bash, but since the goal of
    // this module is to match Bash's rules, we escape a leading {}
    if(str.substr(0, 2) === '{}')
    {
      str = '\\{\\}' + str.substr(2);
    }

    return expand(escapeBraces(str), true).map(unescapeBraces);
  }

  var identity = function(e)
  {
    return e;
  }

  var embrace = function(str)
  {
    return '{' + str + '}';
  }

  var isPadded = function(el)
  {
    return /^-?0\d/.test(el);
  }

  var lte = function(i, y)
  {
    return i <= y;
  }

  var gte = function(i, y)
  {
    return i >= y;
  }

  var expand = function(str, isTop)
  {
    var expansions = [];

    var m = qq.balanced('{', '}', str);
    
    if(!m || /\$$/.test(m.pre))
    {
      return [str];
    }

    var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
    var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
    var isSequence = isNumericSequence || isAlphaSequence;
    var isOptions = /^(.*,)+(.+)?$/.test(m.body);

    if(!isSequence && !isOptions)
    {
      // {a},b}
      if (m.post.match(/,.*\}/))
      {
        str = m.pre + '{' + m.body + escClose + m.post;
        return expand(str);
      }

      return [str];
    }

    var n;

    if (isSequence)
    {
      n = m.body.split(/\.\./);
    }
    else
    {
      n = parseCommaParts(m.body);
      
      if(n.length === 1)
      {
        // x{{a,b}}y ==> x{a}y x{b}y
        n = expand(n[0], false).map(embrace);

        if(n.length === 1)
        {
          var post = m.post.length
            ? expand(m.post, false)
            : [''];

          return post.map(function(p)
          {
            return m.pre + n[0] + p;
          });
        }
      }
    }

    // at this point, n is the parts, and we know it's not a comma set
    // with a single entry.

    // no need to expand pre, since it is guaranteed to be free of brace-sets
    var pre = m.pre;
    var post = m.post.length
      ? expand(m.post, false)
      : [''];

    var N;

    if(isSequence)
    {
      var x = numeric(n[0]);
      var y = numeric(n[1]);
      var width = Math.max(n[0].length, n[1].length);
      
      var incr = n.length == 3
        ? Math.abs(numeric(n[2]))
        : 1;

      var test = lte;
      var reverse = y < x;
      
      if(reverse)
      {
        incr *= -1;
        test = gte;
      }

      var pad = n.some(isPadded);

      N = [];

      for(var i = x; test(i, y); i += incr)
      {
        var c;

        if(isAlphaSequence)
        {
          c = String.fromCharCode(i);
          if (c === '\\')
          {
            c = '';
          }
        }
        else
        {
          c = String(i);

          if(pad)
          {
            var need = width - c.length;

            if(need > 0)
            {
              var z = new Array(need + 1).join('0');

              if(i < 0)
              {
                c = '-' + z + c.slice(1);
              }
              else
              {
                c = z + c;
              }
            }
          }
        }

        N.push(c);
      } // for i
    }
    else
    {
      N = qq.concatMap(n, function(el) { return expand(el, false) });
    }

    for(var j = 0; j < N.length; j++)
    {
      for(var k = 0; k < post.length; k++)
      {
        var expansion = pre + N[j] + post[k];

        if(!isTop || isSequence || expansion)
        {
          expansions.push(expansion);
        }
      }
    }

    return expansions;
  } /* end expand */

  function registerBraceExpansion(qq)
  {
    qq.expand = expandTop;
  };

  if(_isNode == false)
  {
    registerBraceExpansion(qq);
  }

}).apply(this, [qq]);