package com.epicbattle.epicb_api.controller;

import org.springframework.web.bind.annotation.RequestMapping;

// Controlador que redirecciona las rutas al frontend de Angular.
public class WebController {

    @RequestMapping (value = "/{[path:[^\\.]*}")
    public String redirect (){
        return "forward:/";
    }
}
