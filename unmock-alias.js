import path from 'path';

export default function ({ types: t }) {
    function transformUnmockCall(nodePath, state, filesMap) {
        if (
            !t.isMemberExpression(nodePath.node.callee) ||
            !t.isIdentifier(nodePath.node.callee.property, { name: 'unmock' }) ||
            !t.isIdentifier(nodePath.node.callee.object, { name: 'jest' })
        ) {
            return;
        }

        const toUnmock = nodePath.node.arguments[0];

        if (toUnmock && toUnmock.type === 'StringLiteral') {
            const modulePath = mapModule(toUnmock.value, state, filesMap);
            if (modulePath) {
                nodePath.replaceWith(t.callExpression(nodePath.node.callee, [t.stringLiteral(modulePath)]));
            }
        }
    }

    function createFilesMap(state) {
        let opts = state.opts;
        if (!Array.isArray(opts)) {
            opts = [opts];
        }

        return opts.reduce((obj, r) => {
            obj[r.expose] = r.src;
            return obj;
        }, {});
    }

    return {
        visitor: {
            CallExpression: {
                exit(nodePath, state) {
                    return transformUnmockCall(nodePath, state, createFilesMap(state));
                }
            }
        }
    };
}

function mapModule(modulePath, state, filesMap) {
    const pathSplit = modulePath.split('/');

    let src;
    while (pathSplit.length) {
        const pathPartial = pathSplit.join('/');

        if (filesMap.hasOwnProperty(pathPartial)) {
            src = filesMap[pathPartial];
            break;
        }

        pathSplit.pop();
    }

    if (!pathSplit.length) return null;

    return mapToRelative(state.file.opts.filename, modulePath.replace(pathSplit.join('/'), src));
}

function resolve(filename) {
    if (path.isAbsolute(filename)) return filename;
    if (process.env.PWD) return path.resolve(process.env.PWD, filename);
    return path.resolve(filename);
}

function mapToRelative(currentFile, module) {
    const from = resolve(path.dirname(currentFile));
    const to = resolve(path.normalize(module));
    let moduleMapped = path.relative(from, to);

    return moduleMapped[0] !== '.' ? `./${moduleMapped}` : moduleMapped;
}