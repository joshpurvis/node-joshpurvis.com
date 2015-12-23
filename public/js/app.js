/*
    Josh Purvis - 2013
    http://joshpurvis.com/projects/dnsvis
*/

var dns = (function (parent, $) {
    var self = parent;

    self.init = function() {
        self.events();
    };

    self.events = function() {
        $('#btnSearch').on('click', function(e){
            $('#query').blur();
            self.search();
            e.preventDefault();
            return false;
        });

        $('#query').on('keyup', function(e) {
            var code = e.keyCode || e.which;
            if (code == 13) {
                this.blur();
                self.search();
                e.preventDefault();
                return false;
            }
        });

        $('#query').on('focus', function() {
            this.select();
        });

        $('#btnSearch').button();
    };

    self.search = function() {
        var w = 960,
            h = 500;

        var value = $('#query').val();
        var enable_mx = $("#enable_mx").is(':checked') ? 1 : 0;
        if (value === '') return;
        self.clear();
        $('#btnSearch').button('loading');
        d3.json('/dns/' + value.replace(/.*?:\/\//g, "") + "?enable_mx=" + enable_mx, function(e, data) {
            if (e) {
                $('#searchError').show();
                $('#query').focus();
                $('#btnSearch').button('reset');
                return console.warn(e);
            }
            var nodes = {};
            var links = data.links;

            links.forEach(function(link) {
                link.source = nodes[link.source] || (nodes[link.source] = {
                    name: link.source,
                    weight: link.weight
                });
                link.target = nodes[link.target] || (nodes[link.target] = {
                    name: link.target,
                    weight: link.weight
                });
                if (link.type === 'ns') {
                    link.source.fixed = true;
                    link.source.x = 50;
                    link.source.y = 50;
                }
            });





            var force = d3.layout.force()
                .nodes(d3.values(nodes))
                .links(links)
                .size([w, h])
                .linkDistance(200)
                .charge(-300)
                .on("tick", tick)
                .start();

            var svg = d3.select("body").append("svg:svg")
                .attr("viewBox", "0 0 " + w + " " + h )
                .attr("preserveAspectRatio", "xMinYMin");

            // Per-type markers
            svg.append("svg:defs").selectAll("marker")
                .data(["na", "a", "mx"])
                .enter().append("svg:marker")
                    .attr("id", String)
                    .attr("viewBox", "0 -5 10 10")
                    .attr("refX", 15)
                    .attr("refY", -1.5)
                    .attr("markerWidth", 6)
                    .attr("markerHeight", 6)
                    .attr("orient", "auto")
                .append("svg:path")
                    .attr("d", "M0,-5L10,0L0,5");

            var path = svg.append("svg:g").selectAll("path")
                .data(force.links())
                .enter().append("svg:path")
                    .attr("class", function(d) { return "link " + d.type; })
                    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

            var circle = svg.append("svg:g").selectAll("circle")
                .data(force.nodes())
                .enter().append("svg:circle")
                    .attr("r", 6)
                    .call(force.drag)
                    .attr("class", function(d) {
                        if(d.fixed) {
                            return "sticky";
                        }
                    })
                    .on("mousedown", function(d) {
                        d.fixed = true;
                        d3.select(this).classed("sticky", true);
                    })
                    .on("click", function(d){
                        d.fixed = false;
                        d3.select(this).classed("sticky", false);
                    });


            var text = svg.append("svg:g").selectAll("g")
                .data(force.nodes())
                .enter().append("svg:g");

            text.append("svg:text")
                .attr("x", 8)
                .attr("y", ".31em")
                .attr("class", "shadow")
                .text(function(d) { return d.name; });

            text.append("svg:text")
                .attr("x", 8)
                .attr("y", ".31em")
                .text(function(d) { return d.name; });

            function tick() {
                path.attr("d", function(d) {
                    var dx = d.target.x - d.source.x,
                        dy = d.target.y - d.source.y,
                        dr = Math.sqrt(dx * dx + dy * dy);
                    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                });


                circle.attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

                text.attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
            }

            $('#btnSearch').button('reset');

        });
    };

    self.clear = function() {
        $('#searchError').hide();
        d3.select("svg").remove();
    };

    return self;
}(dns || {}, jQuery));