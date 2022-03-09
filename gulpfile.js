// IMPORT PACKAGES
const autoprefixer = require("autoprefixer");
const { init, stream, reload } = require("browser-sync").create();
const cssnano = require("cssnano");
const { src, dest, series, parallel, watch } = require("gulp");
const postcss = require("gulp-postcss");
const { sync, logError } = require("gulp-sass")(require("sass"));
const ts = require("gulp-typescript");
const terser = require("gulp-terser");

// CREATING PATH VARIABLES
const source = {
  css: [
    ["src/sass/**/*.sass", "src/sass/**/*.scss"], // sass or scss path for postcss
    null, // css path for postcss
  ],
  js: [
    "src/typescript/**/*.ts", // ts path for terser
    null, // js path for terser
  ],
};

const dist = {
  css: "dist/css",
  js: "dist/javascript",
};

// CSS TASK
function cssTask() {
  return src(source.css[0] ?? "", { sourcemaps: true })
    .pipe(sync().on("error", logError))
    //.pipe(src([1] ?? "src/*.css"))
    .pipe(postcss([autoprefixer, cssnano]))
    .pipe(dest(dist.css), { sourcemaps: "." })
    .pipe(stream());
}

// JAVASCRIPT TASK
function jsTask() {
  return src(source.js[0] ?? "", { sourcemaps: true })
    .pipe(
      ts({
        target: "esnext",
      })
    )
    .pipe(src(source.js[1] ?? "src/*.js"))
    .pipe(terser())
    .pipe(dest(dist.js), { sourcemaps: "." });
}

// BROWSERSYNC TASK
async function browsersyncTask() {
  init({
    server: {
      basedir: ".",
    },
  });

  watch("*.html").on("change", reload);
  watch(source.css, { ignoreInitial: false }, cssTask);
  watch(source.js, { ignoreInitial: false }, jsTask).on(
    "change",
    series(jsTask, reload)
  );
}

// WATCH TASK
async function watchTask() {
  watch(source.css, { ignoreInitial: false }, cssTask);
  watch(source.js, { ignoreInitial: false }, jsTask);
}

// EXPORTING TASKS
exports.default = browsersyncTask;
exports.watch = watchTask;
exports.build = parallel(cssTask, jsTask);
