using DataEngineerInterviewMaster.Api.Contracts;
using DataEngineerInterviewMaster.Application;
using Microsoft.AspNetCore.Mvc;

namespace DataEngineerInterviewMaster.Api.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController(IChatAssistantService chatService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Ask(ChatApiRequest request, CancellationToken ct)
    {
        var response = await chatService.AskAsync(new ChatRequest(request.UserId, request.Question, request.Topic), ct);
        return Ok(response);
    }
}

