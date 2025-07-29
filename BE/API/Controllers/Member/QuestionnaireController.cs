using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Smoking.API.Models.User;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;

namespace Smoking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "2")]
    public class QuestionnaireController : ControllerBase
    {
        private readonly IQuestionnaireService _questionnaireService;
        private readonly IQuitPlanService _quitPlanService;
        private readonly IUnitOfWork _unitOfWork;


        public QuestionnaireController(
            IQuestionnaireService questionnaireService,
            IQuitPlanService quitPlanService,
            IUnitOfWork unitOfWork)
        {
            _questionnaireService = questionnaireService;
            _quitPlanService = quitPlanService;
            _unitOfWork = unitOfWork;
        }


        [HttpGet("ListQuestion")]
        public async Task<IActionResult> GetQuestionsWithAnswers()
        {
            var questions = await _questionnaireService.GetAllQuestionsWithAnswersAsync();
            return Ok(questions);
        }

        [HttpPost("SubmitAnwser")]
        public async Task<IActionResult> SubmitAnswersByUser(int userId, [FromBody] List<QuitPlanSelectedAnswerDto> dtoAnswers)
        {
            if (!dtoAnswers.Any())
                return BadRequest("Không có câu trả lời nào được gửi.");

            var plans = await _quitPlanService.GetByUserIdAsync(userId);
            var activePlan = plans.FirstOrDefault(p => p.Status == "Active");

            if (activePlan == null)
                return NotFound("Không có kế hoạch hoạt động");

            var answers = dtoAnswers.Select(dto => new QuitPlanSelectedAnswers
            {
                QuitPlanID = activePlan.QuitPlanID,
                AnswerOptionID = dto.AnswerOptionID,
                CustomAnswerText = dto.CustomAnswerText
            }).ToList();

            try
            {
                await _questionnaireService.SaveUserAnswersAsync(activePlan.QuitPlanID, answers);
                return Ok(new { message = "Đã lưu thành công" });
            }
            catch (DbUpdateException ex)
            {
                return BadRequest(new
                {
                    message = "Lỗi khi lưu dữ liệu",
                    detail = ex.InnerException?.Message ?? ex.Message
                });
            }
        }

        [HttpGet("answers-by-user")]
        public async Task<IActionResult> GetAnswersByUser(int userId)
        {
            var plans = await _quitPlanService.GetByUserIdAsync(userId);
            var activePlan = plans.FirstOrDefault(p => p.Status == "Active");

            if (activePlan == null)
                return NotFound("Không có kế hoạch hoạt động");
            var selectedAnswers = await _unitOfWork.QuitPlanSelectedAnswers.FindIncludingAsync(
                x => x.QuitPlanID == activePlan.QuitPlanID,
                x => x.AnswerOption,
                x => x.AnswerOption.Question
            );

            var result = selectedAnswers.Select(sa => new
            {
                sa.SelectedAnswerID,
                sa.AnswerOptionID,
                sa.CustomAnswerText,
                QuestionID = sa.AnswerOption?.QuestionID,
                QuestionText = sa.AnswerOption?.Question?.QuestionText,
                AnswerText = sa.AnswerOption?.AnswerText
            });

            return Ok(result);
        }


        [HttpPut("update-by-user")]
        public async Task<IActionResult> UpdateAnswersByUser(int userId, [FromBody] List<QuitPlanSelectedAnswerDto> dtoAnswers)
        {
            var plans = await _quitPlanService.GetByUserIdAsync(userId);
            var activePlan = plans.FirstOrDefault(p => p.Status == "Active");

            if (activePlan == null)
                return NotFound("Không có kế hoạch hoạt động");

            var existingAnswers = await _unitOfWork.QuitPlanSelectedAnswers.FindIncludingAsync(
                x => x.QuitPlanID == activePlan.QuitPlanID,
                x => x.AnswerOption,
                x => x.AnswerOption.Question
            );

            foreach (var dto in dtoAnswers)
            {
                var questionId = dto.QuestionID;

                var existing = existingAnswers.FirstOrDefault(a => a.AnswerOption.QuestionID == questionId);

                if (existing != null)
                {
                    // Cập nhật câu trả lời
                    existing.AnswerOptionID = dto.AnswerOptionID;
                    existing.CustomAnswerText = dto.CustomAnswerText;

                    _unitOfWork.QuitPlanSelectedAnswers.Update(existing);
                }
                else
                {
                    // Thêm mới
                    var newAnswer = new QuitPlanSelectedAnswers
                    {
                        QuitPlanID = activePlan.QuitPlanID,
                        AnswerOptionID = dto.AnswerOptionID,
                        CustomAnswerText = dto.CustomAnswerText
                    };

                    await _unitOfWork.QuitPlanSelectedAnswers.AddAsync(newAnswer);
                }
            }

            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Đã cập nhật câu trả lời" });
        }


    }
}
