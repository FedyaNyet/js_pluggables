var Templator = function(){

	//holds jquery dom elements that have been detached on-load
	var templates = {};

	//This holds translations for templateless DOM structures. 
	//It lets the templator know what to remove when rendering a template specific template
	var key_selector_map;

	//renders a single object to a jquery object stored in templates. 
	var render_object= function(template, object){
		if (!template || !object) return;
		if ("attr" in object)
			template.attr(object.attr);
		if ("html" in object)
			template.html(object.html);
		if ("prepend" in object)
			template.prepend(object.prepend);
		if ("append" in object)
			template.append(object.append);
		if("children" in object)
			for(var child_selector in object.children){
				child = template.find(child_selector);
				render_object(child, object.children[child_selector]);
			}
	};
	//Create template objects and remove them from DOM starting from the inner-most template.
	var gather= function(){
		var childless_templates = $('[data-template_name]:not(:has([data-template_name]))');
		childless_templates.each(function(){
			var template_name = $(this).attr('data-template_name');
			templates[template_name] = $(this);
			var parent = $(this).parent().closest('[data-template_name]');
			if(parent.length)
				$(this).attr('template_parent', parent.attr('data-template_name'));
			$(this).replaceWith($('<div>').attr('data-template_place',template_name));
		});
		if(childless_templates.length){
			//recursivly call until no childless templates exist.
			gather();
		}
	};

	//Public Templator methods
	return {
		/**
		 * This is used to instantiate the Templator. The Templator expects the templates to 
		 * be in the current page's DOM but if they arn't, it will fall back to fetching them 
		 * from a provided url.
		 * @param  {[string,optional]} url                            [In the event that no 
		 * templates are present on the page, this url will be used to fetch them from a page 
		 * that does have the templates.]
		 * @param  {[dictionary,optional]} template_key_selector_map  [This allows the 
		 * Templator to have an association of non-templated objects that you want to be able 
		 * to replace with templates. This can be acheived by providing a dictionary where they 
		 * key is the replacing template name, and the value is the selector of the element 
		 * being replaced.]
		 */
		init: function(url, template_key_selector_map){
			if(!templates.length)
				gather();
			//if that didn't work, fall back to getting the templates from the provided url...
			if(!templates.length){
				this.key_selector_map = template_key_selector_map;
				$.ajax({
					url:url,
					success: function(template_page){
						response = $(template_page);
						top_templates = response.find('[data-template_name]').filter(function(index){
							has_no_parent_template = $(this).parent().closest('[data-template_name]').length === 0;
							return has_no_parent_template;
						});
						$('body').append($('<div class="TEMPLATOR_TEMPLATES">').hide().append(top_templates));
						gather();
						$('.TEMPLATOR_TEMPLATES').remove();
					}
				});
			}
		},

		/**
		 * This renders a template into the do accordingly. If the paren't template doesn't 
		 * exist. It will be added automatically. 
		 * @param  {[String]} template_key [The string key defineing the template being rendered.]
		 * @param  {[type]} object       [An object to be rendered. possible keys are: html, attr, 
		 * prepend, append, children. Children should have a dictionary value with keys defining 
		 * child selectors and values having the same structure as other rederable objects. ]
		 * @param  {[type]} append       [if the assembled template should replace all matching 
		 * templates, or append them to exsting ones.]
		 */
		render: function(template_key, object, append){
			if (!(template_key in templates)) return;
			template = templates[template_key].clone();
			render_object(template, object);
			if(append){
				$('[data-template_place='+template_key+']').before(template);
				return;
			}
			//first time rendering the page.
			var selector = '[data-template_place='+template_key+'],[data-template_name='+template_key+']';
			if(template_key in this.key_selector_map){
				selector += "," + this.key_selector_map[template_key];
			}
			$(selector).replaceWith(template);
		},

		get_templates: function(){
			return templates;
		}

	};
}();
