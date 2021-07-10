const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;

// 1.分析依赖，分析有哪些import项
// 2.将ES6转化为ES5

function getModuleInfo(file) {
    // 1.读取文件代码
    const body = fs.readFileSync(file, 'utf-8');
    // 2.将代码转换成AST语法树
    // 将代码字符串 => 对象 => 对象遍历解析
    const ast = parser.parse(body, {
        sourceType: 'module'
    })
    // 3.收集依赖
    const deps = {};
    traverse(ast, {
        ImportDeclaration({ node }) {
            const dirname = path.dirname(file);
            const abspath = './' + path.join(dirname, node.source.value);
            deps[node.source.value] = abspath.replace('\\', '/');
        }
    })
    // 3.将ES6 => ES5
    const { code } = babel.transformFromAst(ast, null, {
        presets: ['@babel/preset-env']
    })

    const moduleInfo = { file, deps, code };
    return moduleInfo;
}

console.log(getModuleInfo('./src/index.js'));
