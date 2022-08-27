const gulp = require("gulp");
const merge = require("merge-stream");
const fileinclude = require("gulp-file-include");
const browserSync = require("browser-sync").create();
const dartSass = require("dart-sass"); // dart sass
const sass = require("gulp-sass")(require("sass")); // gulp-sass 연결(기본)
const Fiber = require("fibers"); // dart sass 이용시 gulp-sass와 세트 플러그인
const sourcemaps = require("gulp-sourcemaps"); // css.map 파일 생성용
const autoprefixer = require("gulp-autoprefixer"); // 고려할 브라우저 버전 설정
const spritesmith = require("gulp.spritesmith"); // 스프라이트 이미지, scss 생성용
const del = require("del");
const cssnano = require('gulp-cssnano');

const clean = () => {
    return del(["dist"]);
};

const copy = () => {
    const image = gulp.src(["src/img/**/*"]).pipe(gulp.dest("./dist/img/"));
    const js = gulp.src(["src/js/**/*"]).pipe(gulp.dest("./dist/js/"));
    return merge(image, js);
};

const sprite = () => {
    const spriteData = gulp.src("./src/sprite/*.png").pipe(
        spritesmith({
            imgName: "../sprite/sprite.png",
            cssName: "_sprite.scss",
            retinaSrcFilter: "./src/sprite/*-2x.png",
            retinaImgName: "../sprite/sprite-2x.png",
            cssOpts: {
                cssSelector: ({ name }) => {
                    return ".sprite-" + name;
                },
            },
            padding: 5,
        })
    );

    const image = spriteData.img.pipe(gulp.dest("./dist/sprite"));
    const css = spriteData.css.pipe(gulp.dest("./src/scss"));
    return merge(image, css).pipe(browserSync.stream());
};

const sassToCss = () => {
    const options = {
        fiber: Fiber,
        sass: {
            outputStyle: "expanded", // 스타일: nested(default), expanded, compact, compressed
            indentType: "tab", // 들여쓰기 타입: space(default) , tab
            indentWidth: 1, // 들여쓰기 수: 2(default)
            compiler: dartSass,
        },
    };

    return gulp
        .src("src/scss/**/**/**.scss") // 불러올 scss 위치 지정
        .pipe(sourcemaps.init())
        .pipe(sass(options).on("error", sass.logError))
        .pipe(autoprefixer())
        .pipe(cssnano({zindex: false, autoprefixer: false}))
        .pipe(sourcemaps.write("./maps")) // 저장할 map 저장 위치 지정
        .pipe(gulp.dest("./dist/css")) // 변환된 css 저장 위치 지정
        .pipe(browserSync.stream()); // browserSync 가 실행되고 있을 때, scss 변화가 감지되면 바로 수정 반영
};

const includeFile = () => {
    return gulp
        .src([
            "./src/html/**/**/**.html",
            "!" + "./src/html/include/**.html",
            "!" + "./src/html/html*",
        ])
        .pipe(
            fileinclude({
                prefix: "@@",
                bashpath: "@file",
            })
        )
        .pipe(gulp.dest("./dist/"))
        .pipe(browserSync.stream());
};

const sync = () => {
    browserSync.init(null, {
        server: {
            baseDir: "dist", // 서버에 띄울 폴더 위치 지정
            directory: true,
            index: "index.html",
        },
    });

    gulp.watch(
        "./src/**/**/**/**",
        gulp.parallel([copy, sassToCss, includeFile])
    );
    gulp.watch("./src/sprite/**", gulp.parallel([sprite]));
    gulp.watch("src/**/**/**/**").on("change", browserSync.reload);
};


gulp.task('default', gulp.series(clean, [
    copy,
    sprite,
    sassToCss,
    includeFile,
    sync,
]));