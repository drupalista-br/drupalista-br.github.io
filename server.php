<?php
$ps = "ps -ef | grep 'jekyll' | grep -v grep";
$options = ['start', 'kill', 'list', 'restart'];
$start = function() {
    // to specify ports call:
    // bundle exec jekyll serve --livereload --livereload-port 35729 -P 4000
    $tmp = sys_get_temp_dir();
    $server = "bundle exec jekyll serve --livereload > {$tmp}/jekyll_server.txt 2>&1 &";
    $build = function(string $folder) : string {
        return "cd documentacao/{$folder} && bundle exec jekyll build --watch --incremental > /dev/null 2>&1 &";
    };
    foreach(['home', 'contador', 'cliente'] as $folder) {
        $cmd = $server;
        if ($folder !== 'home')
            $cmd = $build($folder);

        shell_exec($cmd);
    }
};
$kill = function() use ($ps) {
    shell_exec("{$ps} | awk '{print $2}' | xargs kill -9");
};
$list = function() use ($ps) {
    print shell_exec("{$ps} | awk '{print $2,$9,$10,$11,$12}' OFS='\t'");
};
$restart = function() use ($kill, $start) {
    $kill();
    $start();
};
print_r($options);
if (!isset($argv[1]))
    $argv[1] = readline('Option: ');

${$options[$argv[1]]}();
