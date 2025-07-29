using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Smoking.API.Models.Admin;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces;
using Smoking.DAL.Interfaces.Repositories;

namespace Smoking.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "1")]
    public class AdminQuestionnaireController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public AdminQuestionnaireController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // ✅ Lấy toàn bộ câu hỏi và đáp án
        [HttpGet("all")]
        public async Task<IActionResult> GetAllQuestionsWithAnswers()
        {
            var questions = await _unitOfWork.Questions.GetQuestionsWithAnswersAsync(); // Include AnswerOptions
            var result = questions.Select(q => new QuestionWithAnswersDto
            {
                QuestionID = q.QuestionID,
                QuestionText = q.QuestionText,
                QuestionType = q.QuestionType,
                DisplayOrder = q.DisplayOrder,
                IsActive = q.IsActive,
                AnswerOptions = q.AnswerOptions.Select(a => new AnswerOptionDto
                {
                    AnswerOptionID = a.AnswerOptionID,
                    AnswerText = a.AnswerText,
                    DisplayOrder = a.DisplayOrder
                }).ToList()
            });

            return Ok(result);
        }

        // ✅ Tạo mới câu hỏi + đáp án
        [HttpPost("create")]
        public async Task<IActionResult> CreateQuestionWithAnswers([FromBody] QuestionWithAnswersDto dto)
        {
            var question = new Question
            {
                QuestionText = dto.QuestionText,
                QuestionType = dto.QuestionType,
                DisplayOrder = dto.DisplayOrder,
                IsActive = dto.IsActive,
                AnswerOptions = dto.AnswerOptions.Select(a => new AnswerOption
                {
                    AnswerText = a.AnswerText,
                    DisplayOrder = a.DisplayOrder
                }).ToList()
            };

            await _unitOfWork.Questions.AddAsync(question);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Đã tạo câu hỏi", question.QuestionID });
        }

        // ✅ Cập nhật câu hỏi + cập nhật đáp án
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateQuestionWithAnswers(int id, [FromBody] QuestionWithAnswersDto dto)
        {
            var question = await _unitOfWork.Questions.GetQuestionsWithAnswersByIdAsync(id);
            if (question == null)
                return NotFound("Không tìm thấy câu hỏi");

            // Cập nhật thông tin câu hỏi
            question.QuestionText = dto.QuestionText;
            question.QuestionType = dto.QuestionType;
            question.DisplayOrder = dto.DisplayOrder;
            question.IsActive = dto.IsActive;

            // Cập nhật đáp án: Xóa cũ, thêm mới (đơn giản, dễ bảo trì)
            question.AnswerOptions.Clear();
            foreach (var a in dto.AnswerOptions)
            {
                question.AnswerOptions.Add(new AnswerOption
                {
                    AnswerText = a.AnswerText,
                    DisplayOrder = a.DisplayOrder,
                    QuestionID = question.QuestionID
                });
            }

            _unitOfWork.Questions.Update(question);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Đã cập nhật câu hỏi" });
        }

        // ✅ Xoá câu hỏi (và xoá luôn các đáp án)
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var question = await _unitOfWork.Questions.GetQuestionsWithAnswersByIdAsync(id);
            if (question == null)
                return NotFound("Không tìm thấy câu hỏi");

            _unitOfWork.Questions.Remove(question);
            await _unitOfWork.CompleteAsync();
            return Ok(new { message = "Đã xoá câu hỏi và các đáp án liên quan" });
        }
    }
}
