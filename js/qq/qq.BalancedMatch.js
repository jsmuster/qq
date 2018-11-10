// (MIT)
// Copyright (c) 2013 Julian Gruber <julian@juliangruber.com>
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// https://github.com/juliangruber/balanced-match
// d701a549a7653a874eebce7eca25d3577dc868ac
// Jun 12, 2017

'use strict';

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

/* qq BalancedMatch module */
(function (qq) {
  
  try
  {
    console.log("- injected qq.BalancedMatch.js");
  }
  catch(e)
  {
    alert("didn't inject qq.BalancedMatch.js");
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

        registerBalancedMatch(qq);
        
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

  function balanced(a, b, str)
  {
    if(a instanceof RegExp)
    {
      a = maybeMatch(a, str);
    }

    if(b instanceof RegExp)
    {
      b = maybeMatch(b, str);
    }

    var r = range(a, b, str);

    return r && {
      start: r[0],
      end: r[1],
      pre: str.slice(0, r[0]),
      body: str.slice(r[0] + a.length, r[1]),
      post: str.slice(r[1] + b.length)
    };
  };

  function maybeMatch(reg, str)
  {
    var m = str.match(reg);

    return m ? m[0] : null;
  };

  balanced.range = range;

  function range(a, b, str)
  {
    var begs, beg, left, right, result,
        ai = str.indexOf(a),
        bi = str.indexOf(b, ai + 1),
        i = ai;

    if (ai >= 0 && bi > 0)
    {
      begs = [];
      left = str.length;

      while (i >= 0 && !result)
      {
        if (i == ai)
        {
          begs.push(i);
          ai = str.indexOf(a, i + 1);
        }
        else if (begs.length == 1)
        {
          result = [ begs.pop(), bi ];
        }
        else
        {
          beg = begs.pop();

          if(beg < left)
          {
            left = beg;
            right = bi;
          }

          bi = str.indexOf(b, i + 1);
        }

        i = ai < bi && ai >= 0 ? ai : bi;
      }

      if (begs.length)
      {
        result = [ left, right ];
      }
    }

    return result;
  };

  function registerBalancedMatch(qq)
  {
    qq.balanced = balanced;
  }

  if(_isNode == false)
  {
    registerBalancedMatch(qq);
  }

}).apply(this, [qq]);