import path from 'path'
import when from 'when'
import * as u from '../util'

/**
 * Update content to an archive.
 * @promise Update
 * @param archive {string} Path to the archive.
 * @param files {string} Files to add.
 * @param options {Object} An object of acceptables options to 7z bin.
 * @resolve {array} Arguments passed to the child-process.
 * @progress {array} Listed files and directories.
 * @reject {Error} The error as issued by 7-Zip.
 */
export default function (archive, files, { exePath, ...options } = {}) {
  return when.promise(function (resolve, reject, progress) {

    // Create a string that can be parsed by `run`.
    let command = exePath ? exePath : (/(rar)$/i.test(archive))? '7z' : '7za'
    command += ' u "' + archive + '" "' + files + '"'

    // Start the command
    u.run(command, options)

    // When a stdout is emitted, parse each line and search for a pattern. When
    // the pattern is found, extract the file (or directory) name from it and
    // pass it to an array. Finally returns this array.
    .progress(function (data) {
      var entries = []
      data.split('\n').forEach(function (line) {
        if (line.substr(0, 13) === 'Compressing  ') {
          entries.push(line.substr(13, line.length).replace(path.sep, '/'))
        }
      })
      return progress(entries)
    })

    // When all is done resolve the Promise.
    .then(function () {
      return resolve()
    })

    // Catch the error and pass it to the reject function of the Promise.
    .catch(function (err) {
      return reject(err)
    })

  })
}
