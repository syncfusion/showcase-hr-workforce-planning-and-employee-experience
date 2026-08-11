// Blazor models for the Hiring Pipeline candidate-pipeline screen.
//
// The wire shape is a single list of rows with a string-typed status
// ("new" | "screening" | "interview" | "offer" | "hired" | "rejected"),
// so the Blazor side keeps the status as a string on the row. The
// ApplicantStatus enum + JSON converter below are kept for parity with
// the backend contract but are not used by the page itself.

using System.Text.Json;
using System.Text.Json.Serialization;

namespace BlazorWebApp.Components.Models;

public enum ApplicantStatus { New, Screening, Interview, Offer, Hired, Rejected }

internal sealed class ApplicantStatusJsonConverter : JsonConverter<ApplicantStatus>
{
    public override ApplicantStatus Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var s = reader.GetString();
        return s switch
        {
            "new" => ApplicantStatus.New,
            "screening" => ApplicantStatus.Screening,
            "interview" => ApplicantStatus.Interview,
            "offer" => ApplicantStatus.Offer,
            "hired" => ApplicantStatus.Hired,
            "rejected" => ApplicantStatus.Rejected,
            _ => throw new JsonException($"Unknown ApplicantStatus value '{s}'."),
        };
    }

    public override void Write(Utf8JsonWriter writer, ApplicantStatus value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value switch
        {
            ApplicantStatus.New => "new",
            ApplicantStatus.Screening => "screening",
            ApplicantStatus.Interview => "interview",
            ApplicantStatus.Offer => "offer",
            ApplicantStatus.Hired => "hired",
            ApplicantStatus.Rejected => "rejected",
            _ => value.ToString().ToLowerInvariant(),
        });
    }
}

public sealed record Applicant(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("fullName")] string FullName,
    [property: JsonPropertyName("email")] string? Email,
    [property: JsonPropertyName("initials")] string? Initials,
    [property: JsonPropertyName("position")] string Position,
    [property: JsonPropertyName("department")] string Department,
    [property: JsonPropertyName("location")] string? Location,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("source")] string? Source,
    [property: JsonPropertyName("appliedAt")] string AppliedAt,
    [property: JsonPropertyName("requisitionId")] string? RequisitionId);

public sealed record PagedApplicants(
    [property: JsonPropertyName("items")] IReadOnlyList<Applicant> Items,
    [property: JsonPropertyName("total")] int Total,
    [property: JsonPropertyName("page")] int Page,
    [property: JsonPropertyName("pageSize")] int PageSize);

public sealed record ApplicantCounts(
    [property: JsonPropertyName("all")] int All,
    [property: JsonPropertyName("new")] int New,
    [property: JsonPropertyName("screening")] int Screening,
    [property: JsonPropertyName("interview")] int Interview,
    [property: JsonPropertyName("offer")] int Offer,
    [property: JsonPropertyName("hired")] int Hired,
    [property: JsonPropertyName("rejected")] int Rejected);

public sealed record ApplicantFilters(
    [property: JsonPropertyName("status")] string? Status = null,
    [property: JsonPropertyName("requisitionId")] string? RequisitionId = null,
    [property: JsonPropertyName("page")] int Page = 1,
    [property: JsonPropertyName("pageSize")] int PageSize = 124,
    [property: JsonPropertyName("sort")] string? Sort = "appliedAt:desc");

public sealed record UpdateApplicantStatusRequest(
    [property: JsonPropertyName("status")] string Status);
