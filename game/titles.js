let titles = {
    _titles: [
        "I think I heard something. Did you hear something?",
        "Welcome, unfortunate soul. Make yourself comfortable.",
        "There are things that go GHAWRAWARAAAAGGHHH in the night."
    ],
    header: (title, container_size) => {
        // strip ansi escape codes (colors) that artificially inflate the text length
        let clean_title = title.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
        if(clean_title.length < container_size) {
            let spacer = " ".repeat((container_size  - clean_title.length) / 2);
            title = spacer + title + spacer;
        }
        return title;
    },
    random: (container_size) => {
        let idx = Math.random() * titles._titles.length | 0;
        let title = titles._titles[idx];
        return titles.header(title, container_size);
    }
}

module.exports = titles;