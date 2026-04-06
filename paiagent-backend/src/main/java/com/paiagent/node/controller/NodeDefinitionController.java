package com.paiagent.node.controller;

import com.paiagent.common.result.R;
import com.paiagent.node.dto.NodeCategoryDTO;
import com.paiagent.node.service.NodeDefinitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/nodes")
@RequiredArgsConstructor
public class NodeDefinitionController {

    private final NodeDefinitionService nodeDefinitionService;

    @GetMapping("/definitions")
    public R<List<NodeCategoryDTO>> getDefinitions() {
        return R.ok(nodeDefinitionService.getGroupedDefinitions());
    }
}
